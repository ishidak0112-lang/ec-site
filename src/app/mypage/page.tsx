'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, User, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import {
  fulfillmentStatusColor,
  fulfillmentStatusLabel,
  packageConditionLabel,
  accountingStatusLabel,
  returnStatusLabel,
} from '@/lib/orderLabels'
import { prepareLogoutClearCart } from '@/lib/cartStore'
import { JAPAN_PREFECTURES } from '@/lib/japanPrefectures'
import { Gender } from '@prisma/client'
import { genderLabel } from '@/lib/profileLabels'
import type { OrderDetail } from '@/types'

export default function MyPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'orders' | 'profile'>('orders')
  const [orders, setOrders] = useState<OrderDetail[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<string>('UNKNOWN')
  const [prefecture, setPrefecture] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [returnSubmittingId, setReturnSubmittingId] = useState<string | null>(null)
  const [returnMessageByOrderId, setReturnMessageByOrderId] = useState<Record<string, string>>({})
  const [packageConditionByOrderId, setPackageConditionByOrderId] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status !== 'authenticated' || tab !== 'profile') return
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.name != null) setName(data.name)
        if (data?.gender) setGender(data.gender)
        setPrefecture(data?.prefecture ?? '')
      })
      .catch(() => {})
  }, [status, tab])

  useEffect(() => {
    if (status !== 'authenticated') return
    setName(session?.user?.name ?? '')
    setOrdersLoading(true)
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [status, session?.user?.name])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/mypage')
    }
  }, [status, router])

  const handleProfileSave = async () => {
    setProfileSaving(true)
    setProfileMessage(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          gender,
          prefecture: prefecture || null,
        }),
      })
      if (res.ok) {
        await update()
        setProfileMessage({ type: 'success', text: '保存しました' })
      } else {
        const data = await res.json()
        setProfileMessage({ type: 'error', text: data.error ?? '保存に失敗しました' })
      }
    } catch {
      setProfileMessage({ type: 'error', text: '保存に失敗しました' })
    } finally {
      setProfileSaving(false)
    }
  }

  const canRequestReturn = (order: OrderDetail) =>
    ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status) &&
    (order.returnStatus ?? 'NONE') === 'NONE'

  const handleReturnRequest = async (order: OrderDetail) => {
    setReturnSubmittingId(order.id)
    setReturnMessageByOrderId(prev => ({ ...prev, [order.id]: '' }))

    try {
      const packageCondition = packageConditionByOrderId[order.id]
      const res = await fetch(`/api/orders/${order.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageCondition: packageCondition && packageCondition !== 'UNCONFIRMED' ? packageCondition : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? '返品申請に失敗しました')
      }

      setOrders(prev => prev.map(o => (o.id === order.id ? data : o)))
      setReturnMessageByOrderId(prev => ({ ...prev, [order.id]: '返品申請を受け付けました。確認後にステータスを更新します。' }))
    } catch (error) {
      const message = error instanceof Error ? error.message : '返品申請に失敗しました'
      setReturnMessageByOrderId(prev => ({ ...prev, [order.id]: message }))
    } finally {
      setReturnSubmittingId(null)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>
  }

  if (status === 'unauthenticated' || !session) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl tracking-tight mb-12">マイページ</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav className="space-y-2">
            {[
              { key: 'orders', label: '注文履歴', icon: Package },
              { key: 'profile', label: 'プロフィール', icon: User },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key as 'orders' | 'profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${tab === key ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <Icon className="w-5 h-5" />{label}
              </button>
            ))}
            <button
              onClick={() => {
                prepareLogoutClearCart()
                signOut({ callbackUrl: '/' })
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-5 h-5" />ログアウト
            </button>
          </nav>
        </aside>

        <main className="lg:col-span-3">
          {tab === 'orders' && (
            <div>
              <h2 className="text-2xl mb-8">注文履歴</h2>
              {ordersLoading ? (
                <p className="text-gray-500">読み込み中...</p>
              ) : orders.length === 0 ? (
                <p className="text-gray-500">注文履歴はありません</p>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-200 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">注文日: {new Date(order.createdAt).toLocaleDateString('ja-JP')}</p>
                          <p className="text-sm text-gray-600">注文番号: #{order.id.slice(0, 8)}...</p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs ${fulfillmentStatusColor[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                        >
                          {fulfillmentStatusLabel[order.status] ?? order.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-6">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product.name} × {item.quantity}</span>
                            <span>¥{(item.unitPrice * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                          <span>
                            開封:{' '}
                            {packageConditionLabel[order.packageCondition ?? 'UNCONFIRMED'] ??
                              order.packageCondition}
                          </span>
                          <span>
                            会計:{' '}
                            {accountingStatusLabel[order.accountingStatus ?? 'PENDING'] ??
                              order.accountingStatus}
                          </span>
                          <span>
                            返品:{' '}
                            {returnStatusLabel[order.returnStatus ?? 'NONE'] ?? order.returnStatus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            配送先: {order.shippingZip}{' '}
                            {order.shippingPrefecture ? `${order.shippingPrefecture} ` : ''}
                            {order.shippingCity}
                            {order.shippingAddress}
                          </p>
                          <p className="text-lg">合計: ¥{order.totalAmount.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          返品・返金は
                          <a href="/legal/returns" className="underline ml-0.5">
                            返品・契約解除について
                          </a>
                          をご確認ください。
                        </p>
                        <div className="pt-2">
                          {canRequestReturn(order) ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={packageConditionByOrderId[order.id] ?? 'UNCONFIRMED'}
                                onChange={(e) =>
                                  setPackageConditionByOrderId(prev => ({ ...prev, [order.id]: e.target.value }))
                                }
                                className="text-xs px-2 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                              >
                                <option value="UNCONFIRMED">開封状態を選択（任意）</option>
                                <option value="UNOPENED">開封前</option>
                                <option value="OPENED">開封済み</option>
                              </select>
                              <button
                                onClick={() => handleReturnRequest(order)}
                                disabled={returnSubmittingId === order.id}
                                className="text-xs px-3 py-1 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                              >
                                {returnSubmittingId === order.id ? '申請中...' : '返品申請する'}
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">
                              返品申請が可能な注文のみボタンを表示します。
                            </p>
                          )}
                          {returnMessageByOrderId[order.id] && (
                            <p className="text-xs text-gray-600 mt-2">{returnMessageByOrderId[order.id]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div>
              <h2 className="text-2xl mb-8">プロフィール</h2>
              <div className="border border-gray-200 p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm mb-2">お名前</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">性別</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {Object.values(Gender).map((k) => (
                        <option key={k} value={k}>
                          {genderLabel[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">都道府県（任意）</label>
                    <select
                      value={prefecture}
                      onChange={(e) => setPrefecture(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">未設定</option>
                      {JAPAN_PREFECTURES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">メールアドレス</label>
                    <input type="email" defaultValue={session.user?.email ?? ''} readOnly
                      className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500" />
                  </div>
                  {profileMessage && (
                    <p className={`text-sm ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {profileMessage.text}
                    </p>
                  )}
                  <button
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {profileSaving ? '保存中...' : '保存する'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
