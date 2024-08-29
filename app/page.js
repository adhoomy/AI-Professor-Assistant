'use client'
import { useState, useEffect, useRef } from 'react'
import { Box, Stack, TextField, Button, Avatar } from '@mui/material'

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I'm the AI Professor Assistant Which professor would you like information on?` },
  ])
  const [message, setMessage] = useState('')
  const messageContainerRef = useRef(null)

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    try {
      const newMessages = [...messages, { role: 'user', content: message }, { role: 'assistant', content: '' }]
      setMessages(newMessages)
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Ensure your environment variable is referenced here
        },
        body: JSON.stringify(newMessages)
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let result = ''
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        result += decoder.decode(value, { stream: true })
      }

      const displayText = (text) => {
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1]
          const otherMessages = prevMessages.slice(0, prevMessages.length - 1)
          return [...otherMessages, { ...lastMessage, content: text }]
        })
        scrollToBottom()
      }

      let index = 0
      const typingAnimation = setInterval(() => {
        if (index < result.length) {
          displayText(result.slice(0, index + 1))
          index++
        } else {
          clearInterval(typingAnimation)
        }
      }, 25)

      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="row"
      sx={{
        '@media (max-width: 600px)': {
          flexDirection: 'column',
        },
      }}
    >
      <Box
        width="50vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="#0f2451"
        position="relative"
        sx={{
          '@media (max-width: 600px)': {
            display: 'none',
          },
        }}
      >
        <img src="/logo.jpg" alt="World Tech VI" style={{ width: '100%', height: 'auto' }} />
      </Box>
      <Box
        width="50vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          '@media (max-width: 600px)': {
            width: '100vw',
            height: '100vh',
          },
        }}
      >
        <Stack
          direction={'column'}
          width="100%"
          height="100%"
          border="1px solid black"
          p={2}
          spacing={3}
        >
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
            ref={messageContainerRef}
          >
            {
              messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                  alignItems="flex-start"
                >
                  {message.role === 'assistant' && (
                    <Avatar src="/logo.jpg" alt="World Tech VI" style={{ marginRight: 8, alignSelf: 'flex-start' }} />
                  )}
                  <Box
                    bgcolor={message.role === 'assistant' ? '#0f2451' : '#1976d2'}  // Dark blue for AI and default blue for user
                    color="white"
                    borderRadius={16}
                    p={3}
                    position="relative"
                    display="flex"
                    flexDirection="column"
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <TextField label="Message" fullWidth onChange={(e) => setMessage(e.target.value)} value={message} />
            <Button variant="contained" style={{ backgroundColor: '#4b0082', color: 'white' }} onClick={sendMessage}>Send</Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
