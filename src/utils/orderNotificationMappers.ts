import type { ApiNotification, ApiOrder } from '../services/api';
import type { Order, Product } from '../types';

export type UiNotification = {
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    sendAt?: string;
};

const formatDateTime = (value?: string | Date | null) => {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const formatRelativeTime = (value?: string | Date | null, t?: (key: string, options?: any) => string) => {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (typeof t !== 'function') {
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatDateTime(date);
    }
    if (diffMinutes < 1) return t('time_just_now');
    if (diffMinutes < 60) return t('time_minutes_ago', { count: diffMinutes });
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return t('time_hours_ago', { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return t('time_days_ago', { count: diffDays });
    return formatDateTime(date);
};

const getOrderStatusText = (status: Order['status'], t: (key: string) => string): string => {
    const statusMap: Record<Order['status'], string> = {
        processing: t('order_status_processing'),
        shipping: t('order_status_shipping'),
        completed: t('order_status_completed'),
        cancelled: t('order_status_cancelled'),
    };
    return statusMap[status];
};

export const mapApiOrderToUi = (order: ApiOrder, productLookup: Product[] = [], t?: (key: string) => string): Order => {
    const created = order.status?.ordered || order.createdAt || new Date().toISOString();
    const hasShipped = Boolean(order.status?.shipped);
    const hasPackaged = Boolean(order.status?.packaged);
    const hasConfirmed = Boolean(order.status?.confirmed);
    const isCompleted = hasShipped && order.paymentStatus === 'paid';
    const isCancelled = Boolean(order.isCancelled);

    let status: Order['status'] = 'processing';
    if (isCancelled) status = 'cancelled';
    else if (isCompleted) status = 'completed';
    else if (hasShipped) status = 'shipping';

    const addressString = [
        order.shippingAddress?.street,
        order.shippingAddress?.ward,
        order.shippingAddress?.district,
        order.shippingAddress?.city,
    ].filter(Boolean).join(', ') || (t ? t('address_none') : 'No address');

    const pickImage = (productId: string) =>
        productLookup.find(p => p.id === productId)?.image || productLookup[0]?.image || '';
    const getTitle = (key: string) => t ? t(key) : key;
    const timeline = [
        { time: formatDateTime(created), title: getTitle('order_placed_success'), active: Boolean(created) },
        { time: formatDateTime(order.status?.confirmed), title: getTitle('order_confirmed'), active: hasConfirmed },
        { time: formatDateTime(order.status?.packaged), title: getTitle('order_packing'), active: hasPackaged },
        { time: formatDateTime(order.status?.shipped), title: getTitle('order_shipping'), active: hasShipped },
    ];

    if (!isCancelled) {
        timeline.push({
            time: isCompleted ? formatDateTime(order.status?.shipped) : '',
            title: getTitle('order_delivery_success'),
            active: isCompleted,
        });
    }

    return {
        id: order._id,
        code: order.code || order._id,
        date: formatDateTime(created),
        createdAt: typeof created === 'string' ? created : new Date(created).toISOString(),
        status,
        statusText: t ? getOrderStatusText(status, t) : status,
        paymentStatus: order.paymentStatus,
        items: order.items.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: pickImage(item.productId),
            selectedOption: item.selectedOption,
            selectedClassification: item.selectedClassification,
        })),
        shippingAddress: {
            name: order.shippingAddress?.name || (t ? t('receiver') : 'Receiver'),
            phone: order.shippingAddress?.phone || '',
            address: addressString,
        },
        payment: {
            method: order.payment || 'cod',
            subtotal: order.subTotal,
            shippingFee: order.shippingFee,
            discount: order.discount,
            total: order.totalPrice,
        },
        timeline,
    };
};

export const mapApiNotificationToUi = (item: ApiNotification, t?: (key: string, options?: any) => string): UiNotification => {
    const fallbackDate = item.deliveredAt || item.readAt || item.updatedAt || new Date().toISOString();
    const sendAt = item.sendAt || item.createdAt || fallbackDate;
    return {
        id: item.id || item._id || '',
        type: item.type || 'system',
        title: item.title || '',
        message: item.body || '',
        time: formatRelativeTime(sendAt, t),
        read: Boolean(item.isRead),
        sendAt: sendAt || undefined,
    };
};
