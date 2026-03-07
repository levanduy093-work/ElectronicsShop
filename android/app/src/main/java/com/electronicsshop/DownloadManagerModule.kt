package com.electronicsshop

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.webkit.MimeTypeMap
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class DownloadManagerModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "DownloadManagerModule"

  @ReactMethod
  fun downloadAndOpen(url: String, fileName: String, promise: Promise) {
    try {
      val safeName = fileName.replace(Regex("[^a-zA-Z0-9._-]"), "_")
      val request = DownloadManager.Request(Uri.parse(url))
        .setTitle(safeName)
        .setDescription("Downloading file")
        .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, safeName)
        .setAllowedOverMetered(true)
        .setAllowedOverRoaming(true)

      val dm = reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
      val downloadId = dm.enqueue(request)

      val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
          val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
          if (id != downloadId) return

          try {
            val query = DownloadManager.Query().setFilterById(downloadId)
            val cursor = dm.query(query)
            val status = if (cursor != null && cursor.moveToFirst()) {
              cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))
            } else {
              DownloadManager.STATUS_FAILED
            }
            cursor?.close()

            if (status != DownloadManager.STATUS_SUCCESSFUL) {
              promise.reject("DOWNLOAD_FAILED", "Download failed")
              return
            }

            var uri: Uri? = dm.getUriForDownloadedFile(downloadId)
            if (uri == null) {
              val file = File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                safeName
              )
              uri = FileProvider.getUriForFile(
                reactContext,
                reactContext.packageName + ".fileprovider",
                file
              )
            }

            val mime = MimeTypeMap.getSingleton()
              .getMimeTypeFromExtension(MimeTypeMap.getFileExtensionFromUrl(url))
              ?: "application/pdf"

            val openIntent = Intent(Intent.ACTION_VIEW).apply {
              setDataAndType(uri, mime)
              addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
              addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            if (openIntent.resolveActivity(reactContext.packageManager) != null) {
              reactContext.startActivity(openIntent)
              promise.resolve(true)
            } else {
              promise.reject("NO_APP", "No app available to open this file")
            }
          } finally {
            try {
              reactContext.unregisterReceiver(this)
            } catch (_: Exception) {
            }
          }
        }
      }

      val filter = IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        reactContext.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
      } else {
        reactContext.registerReceiver(receiver, filter)
      }
    } catch (e: Exception) {
      promise.reject("DOWNLOAD_ERROR", e.message, e)
    }
  }
}
