import React from 'react';
import './Chatbot.css'; 
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');

  const handleSubmit = async (e) => { 
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: "Eres un experto analista de base de datos, me darás la ruta crítica para culminar un pensum específico guiándote de los id de carreras y la tabla en general."
          },
          ...newMessages
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // Asegúrate de tener tu clave API en un archivo .env
          'Content-Type': 'application/json'
        }
      });

      const botReply = response.data.choices[0].message.content;
      const botMessage = { role: 'assistant', content: botReply };
      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error('Error al obtener respuesta:', error);
    }
  };

  return (
    <div className="chatbot-container">
      <h1 className="chatbot-title">SmartGrade</h1>

      <div className="avatar-wrapper">
        <img src="/logo.png" alt="chatbot Icon" className="chatbot-avatar" />
      </div>

     <div className="chat-bubbles">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message-wrapper ${msg.role === 'user' ? 'right' : 'left'}`}>
          <div className="sender-name">
            {msg.role === 'user' ? 'Tú' : 'SmartGrade'}
          </div>
          <div className={`bubble ${msg.role === 'user' ? 'right' : 'left'}`}>
            {msg.content}
          </div>
        </div>
      ))}
    </div>


      <div className="chat-input-area">
        <form onSubmit={handleSubmit}>
          <textarea
            className="textareaInput"
            id="textareaInput"
            cols="70"
            rows="2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}
