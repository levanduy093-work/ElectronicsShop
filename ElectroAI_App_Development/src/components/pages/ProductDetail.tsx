import React, { useState } from 'react';
import { ArrowLeft, Star, Share2, Heart, ShoppingCart, Minus, Plus, FileText, Cpu, ShieldCheck, User, FileCode, Download } from 'lucide-react';
import { Product } from '../../lib/data';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../../lib/utils';
import { toast } from 'sonner@2.0.3';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}

const MOCK_REVIEWS = [
  {
    id: 1,
    user: "Nguyễn Văn Nam",
    rating: 5,
    date: "20/01/2026",
    comment: "Sản phẩm chính hãng, đóng gói rất cẩn thận. Shop tư vấn nhiệt tình, sẽ ủng hộ dài dài.",
    images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=100"]
  },
  {
    id: 2,
    user: "Trần Thị Hạnh",
    rating: 4,
    date: "18/01/2026",
    comment: "Giao hàng hơi chậm một chút nhưng chất lượng sản phẩm tốt, đúng mô tả.",
    images: []
  },
  {
    id: 3,
    user: "Lê Minh Tuấn",
    rating: 5,
    date: "15/01/2026",
    comment: "Đã test thử, hoạt động ổn định. Giá cả hợp lý so với mặt bằng chung.",
    images: []
  }
];

export function ProductDetail({ 
  product, 
  onBack, 
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  isLoggedIn,
  onRequireLogin
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'datasheet' | 'reviews'>('desc');
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");

  const handleSubmitReview = () => {
      if (!isLoggedIn) {
          toast.error("Vui lòng đăng nhập để viết đánh giá");
          onRequireLogin();
          return;
      }

      if (!newReviewComment.trim()) {
          toast.error("Vui lòng nhập nội dung đánh giá");
          return;
      }

      const newReview = {
          id: Date.now(),
          user: "Tôi (Bạn)", // Trong thực tế sẽ lấy tên user đang login
          rating: newReviewRating,
          date: new Date().toLocaleDateString('vi-VN'),
          comment: newReviewComment,
          images: []
      };

      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      setNewReviewComment("");
      setNewReviewRating(5);
      toast.success("Đánh giá của bạn đã được đăng!");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Xem sản phẩm ${product.name} trên ElectroAI!`,
          url: window.location.href,
        });
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success("Đã sao chép liên kết sản phẩm");
        } catch (err) {
          // Fallback for blocked permission policy
          const textArea = document.createElement("textarea");
          textArea.value = window.location.href;
          
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "0";
          document.body.appendChild(textArea);
          
          textArea.focus();
          textArea.select();
          
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            toast.success("Đã sao chép liên kết sản phẩm");
          } else {
            toast.error("Không thể chia sẻ trên trình duyệt này");
          }
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleHeartClick = () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      onRequireLogin();
      return;
    }
    
    onToggleFavorite();
    if (!isFavorite) {
      toast.success("Đã thêm vào danh sách yêu thích");
    } else {
      toast.info("Đã xóa khỏi danh sách yêu thích");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col animate-slide-up-fade relative z-50">
      {/* Header - Sticky Top */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-950 px-4 h-14 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-700 dark:text-gray-200" />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200 transition-colors"
          >
            <Share2 size={24} />
          </button>
          <button 
            onClick={handleHeartClick}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90",
              isFavorite ? "text-red-500" : "text-gray-700 dark:text-gray-200"
            )}
          >
            <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {/* Product Image */}
        <div className="aspect-square bg-[#F5F5F5] dark:bg-gray-900 relative flex items-center justify-center">
          <ImageWithFallback 
            src={product.image} 
            alt={product.name} 
            className="w-3/4 h-3/4 object-contain mix-blend-multiply dark:mix-blend-normal"
          />
          {product.stock !== 'In Stock' && (
            <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
              {product.stock}
            </div>
          )}
        </div>

        <div className="px-4 py-6">
          {/* Title & Price */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-xl font-bold leading-snug text-gray-900 dark:text-white">{product.name}</h1>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through decoration-gray-400">
                    {product.originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm mt-3">
              <div className="flex items-center gap-1 text-amber-400 font-medium">
                <Star size={16} fill="currentColor" />
                <span className="text-gray-900 dark:text-gray-100">{product.rating}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{product.reviews} đánh giá</span>
              <span className="text-gray-300">|</span>
              <span className="text-green-600 font-medium">Đã bán 1.2k</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center mb-6 overflow-x-auto scrollbar-hide gap-2 px-1">
            {(['desc', 'specs', 'reviews', 'datasheet'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-lg border",
                  activeTab === tab 
                    ? "border-blue-600 text-blue-600 bg-white dark:bg-gray-800 shadow-sm" 
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {tab === 'desc' && 'Mô tả'}
                {tab === 'specs' && 'Thông số'}
                {tab === 'reviews' && 'Đánh giá'}
                {tab === 'datasheet' && 'Datasheet'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[150px] text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {activeTab === 'desc' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-base text-gray-700 dark:text-gray-300">{product.description}</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 mt-6">
                  <ShieldCheck className="text-blue-600 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1 text-base">Cam kết chính hãng</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">Sản phẩm được kiểm tra kỹ lưỡng bởi đội ngũ kỹ thuật ElectroAI.</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 gap-0 divide-y divide-gray-100 dark:divide-gray-800 animate-fade-in">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="py-3 grid grid-cols-2 gap-4">
                    <span className="text-gray-500">{key}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-right">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                {/* Summary Card */}
                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl">
                   <div className="flex gap-6 items-center">
                       <div className="text-center min-w-[100px]">
                          <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-1">{product.rating}</div>
                          <div className="flex text-amber-400 text-xs justify-center gap-0.5 mb-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">{product.reviews} đánh giá</div>
                       </div>
                       
                       <div className="flex-1 space-y-1.5 border-l border-gray-200 dark:border-gray-800 pl-6">
                          {[5, 4, 3, 2, 1].map((star, i) => (
                            <div key={star} className="flex items-center gap-3 text-xs">
                               <span className="w-2 font-medium text-gray-600 dark:text-gray-400">{star}</span>
                               <Star size={10} className="text-gray-400" fill="currentColor" />
                               <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-amber-400 rounded-full" 
                                    style={{ width: i === 0 ? '70%' : i === 1 ? '20%' : '5%' }} 
                                 />
                               </div>
                            </div>
                          ))}
                       </div>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-center">
                        <button 
                            onClick={() => {
                                if (!isLoggedIn) {
                                    toast.error("Vui lòng đăng nhập để viết đánh giá");
                                    onRequireLogin();
                                } else {
                                    setShowReviewForm(true);
                                }
                            }}
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                            <FileText size={16} /> Viết đánh giá của bạn
                        </button>
                   </div>
                </div>

                {/* Review Form Modal */}
                {showReviewForm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowReviewForm(false)} />
                        <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-lg font-bold mb-4 text-center dark:text-white">Viết đánh giá</h3>
                            
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star}
                                        onClick={() => setNewReviewRating(star)}
                                        className="p-1 hover:scale-110 transition-transform"
                                    >
                                        <Star 
                                            size={32} 
                                            className={star <= newReviewRating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-700"} 
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nội dung đánh giá
                                </label>
                                <textarea
                                    value={newReviewComment}
                                    onChange={(e) => setNewReviewComment(e.target.value)}
                                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-sm dark:text-white resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowReviewForm(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={handleSubmitReview}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                                >
                                    Gửi đánh giá
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                   {reviews.map((review) => (
                     <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                 <User size={20} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{review.user}</h4>
                                  <div className="flex text-amber-400 mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-200 dark:text-gray-700" : ""} />
                                    ))}
                                  </div>
                              </div>
                           </div>
                           <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                            {review.comment}
                        </p>
                        
                        {review.images.length > 0 && (
                          <div className="flex gap-3 mt-3">
                            {review.images.map((img, i) => (
                              <div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                <ImageWithFallback src={img} alt="Review" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                     </div>
                   ))}
                   
                   <button className="w-full py-3 text-sm text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors mt-2">
                      Xem tất cả đánh giá
                   </button>
                </div>
              </div>
            )}

            {activeTab === 'datasheet' && (
              <div className="space-y-3 animate-fade-in">
                {/* Datasheet File */}
                <div className="flex items-center p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-red-500 shadow-sm border border-gray-100 dark:border-gray-700">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 ml-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Datasheet.pdf</h4>
                    <p className="text-xs text-gray-500">2.4 MB • Tài liệu kỹ thuật</p>
                  </div>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                    <Download size={20} />
                  </button>
                </div>

                {/* Library Code File */}
                <div className="flex items-center p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-blue-500 shadow-sm border border-gray-100 dark:border-gray-700">
                    <FileCode size={20} />
                  </div>
                  <div className="flex-1 ml-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Library & Example Code</h4>
                    <p className="text-xs text-gray-500">156 KB • Arduino/C++</p>
                  </div>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                    <Download size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 z-50 md:max-w-md md:mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl h-12 px-2">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-full flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
          >
            <Minus size={20} />
          </button>
          <span className="font-semibold w-8 text-center text-lg">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-full flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <button 
          onClick={() => onAddToCart(product, quantity)}
          className="flex-1 bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
        >
          <ShoppingCart size={20} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}