'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const generateUsers = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User${i + 1}`,
    bid: Math.floor(Math.random() * 1000) + 2000,
    quantity: Math.floor(Math.random() * 4) + 1,
    paid: Math.random() > 0.5
  }))
}

export default function Component() {
  const [users, setUsers] = useState(generateUsers(999))
  const [currentUser, setCurrentUser] = useState({ id: 1000, name: "You", bid: 2000, quantity: 1, paid: false })
  const [availableTickets] = useState(100)
  const [timeLeft, setTimeLeft] = useState(600)
  const [auctionStarted, setAuctionStarted] = useState(false)
  const [auctionEnded, setAuctionEnded] = useState(false)
  const [inputBid, setInputBid] = useState('')
  const [inputQuantity, setInputQuantity] = useState('1')
  const [balance, setBalance] = useState(0)
  const [inputBalance, setInputBalance] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (auctionStarted && timeLeft > 0 && !auctionEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !auctionEnded) {
      setAuctionEnded(true)
    }
  }, [timeLeft, auctionEnded, auctionStarted])

  useEffect(() => {
    if (auctionStarted && !auctionEnded) {
      const interval = setInterval(() => {
        setUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            bid: Math.random() > 0.9 ? user.bid + Math.floor(Math.random() * 100) : user.bid
          }))
        )
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [auctionStarted, auctionEnded])

  useEffect(() => {
    const allUsers = [...users, currentUser].sort((a, b) => b.bid - a.bid)
    const currentUserRank = allUsers.findIndex(user => user.id === currentUser.id) + 1
    if (currentUserRank > availableTickets && !showWarning) {
      setShowWarning(true)
    } else if (currentUserRank <= availableTickets && showWarning) {
      setShowWarning(false)
    }
  }, [users, currentUser, availableTickets, showWarning])

  const addBalance = () => {
    const amount = parseFloat(inputBalance)
    if (!isNaN(amount) && amount > 0) {
      setBalance(prevBalance => prevBalance + amount)
      setInputBalance('')
      if (!auctionStarted) {
        setAuctionStarted(true)
        setCurrentUser(prev => ({ ...prev, paid: true }))
      }
    } else {
      alert("請輸入有效的金額")
    }
  }

  const updateBid = () => {
    const newBid = Number(inputBid)
    const newQuantity = Number(inputQuantity)
    if (newBid < 2000) {
      alert("出價不能低於起始價格 NT$2000")
      return
    }
    if (newBid * newQuantity > balance) {
      alert("餘額不足，請先匯入更多款項")
      return
    }
    if (newQuantity < 1 || newQuantity > 4) {
      alert("購買數量必須在1到4之間")
      return
    }
    setCurrentUser({ ...currentUser, bid: newBid, quantity: newQuantity })
    setInputBid('')
    setInputQuantity('1')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const allUsers = [...users, currentUser].sort((a, b) => b.bid - a.bid)
  const currentUserRank = allUsers.findIndex(user => user.id === currentUser.id) + 1
  const lowestWinningBid = allUsers[availableTickets - 1]?.bid || 2000

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>優先選購售票服務</CardTitle>
        <CardDescription>
          起始價格：NT$2000 | 可用票數：{availableTickets} | 競標人數：1000
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">帳戶餘額</h3>
            <p>當前餘額：NT${balance}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Input 
                type="text" 
                placeholder="輸入匯入金額" 
                value={inputBalance}
                onChange={(e) => setInputBalance(e.target.value)}
              />
              <Button onClick={addBalance}>匯入款項</Button>
            </div>
          </div>
          {auctionStarted && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">拍賣狀態</h3>
                <p>剩餘時間：{formatTime(timeLeft)}</p>
                <Progress value={(600 - timeLeft) / 6} className="w-full" />
                <p>當前最低中標價：NT${lowestWinningBid}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">您的狀態</h3>
                <p>當前出價：NT${currentUser.bid}</p>
                <p>購買數量：{currentUser.quantity}張</p>
                <p>當前排名：{currentUserRank}</p>
              </div>
              {showWarning && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>警告</AlertTitle>
                  <AlertDescription>
                    您已被擠出優先購票排序，請考慮調整您的出價或購買數量。
                  </AlertDescription>
                </Alert>
              )}
              <div>
                <h3 className="text-lg font-semibold mb-2">出價</h3>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    placeholder="輸入您的出價" 
                    value={inputBid}
                    onChange={(e) => setInputBid(e.target.value)}
                    min={2000}
                    disabled={auctionEnded}
                    ref={inputRef}
                  />
                  <Input 
                    type="number" 
                    placeholder="購買數量" 
                    value={inputQuantity}
                    onChange={(e) => setInputQuantity(e.target.value)}
                    min={1}
                    max={4}
                    disabled={auctionEnded}
                  />
                  <Button onClick={updateBid} disabled={auctionEnded}>確認出價</Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">優先名單 (前10名)</h3>
                <ul>
                  {allUsers.slice(0, 10).map((user, index) => (
                    <li 
                      key={user.id} 
                      className={`${index < availableTickets ? 'text-green-600 font-bold' : ''} ${user.id === currentUser.id ? 'bg-yellow-200' : ''}`}
                    >
                      {user.name} - NT${user.bid} - {user.quantity}張 - 排名：{index + 1}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">
          {auctionEnded 
            ? `拍賣已結束。最終價格：NT$${lowestWinningBid}。如果您的排名在前100名內，您將收到購票通知。` 
            : auctionStarted
              ? "注意：最終價格將以第100名的出價為準。每個帳戶最多可購買4張票。"
              : "請匯入款項以開始拍賣。"}
        </p>
      </CardFooter>
    </Card>
  )
}