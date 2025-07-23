import React from 'react';
import './Chatbot.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [messages, setMessages] = React.useState([
    { role: 'assistant', content: 'Hola, soy SmartGrade, tu asistente académico. Te ayudaré a ver la ruta crítica de tu carrera, para la creación de la misma, por favor responde las preguntas como se te indique. Al final de su creación, puedes preguntar lo que gustes.' },
    { role: 'assistant', content: '¿Cuál es tu carrera? (Ej: ingeniería industrial)' }
  ]);
  const [input, setInput] = React.useState('');
  const [idCarrera, setIdCarrera] = React.useState(null);
  const [materiasCursadas, setMateriasCursadas] = React.useState([]);
  const [maxMateriasUsuario, setMaxMateriasUsuario] = React.useState(null);
  const [estado, setEstado] = React.useState('pedir_carrera');

  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const detectarIdCarrera = (texto) => {
    const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (t.includes('agro')) return 1;
    if (t.includes('electri')) return 2;
    if (t.includes('red') || t.includes('tele')) return 3;
    if (t.includes('indus')) return 4;
    return null;
  };

  const manejarErrorConIA = async (paso, mensajeUsuario) => {
    try {
      const respuestaIA = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Eres un manejador de errores para un chatbot académico. El usuario está en el paso: "${paso}". Si escribe algo fuera del contexto de este paso, explícale amablemente qué debe responder y cómo puede continuar.`
          },
          { role: 'user', content: mensajeUsuario }
        ]
      }, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const mensaje = respuestaIA.data.choices[0].message.content;
      setMessages((prev) => [...prev, { role: 'assistant', content: mensaje }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'No pude ayudarte con IA esta vez. Intenta responder de nuevo como se indica.' }]);
      console.error('Error IA fallback:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto) return;

    const userMessage = { role: 'user', content: texto };
    setInput('');
    setMessages((prev) => [...prev, userMessage]);

    const textoLower = texto.toLowerCase();




    if (estado === 'pedir_carrera') {
      const idDetectado = detectarIdCarrera(texto);
      if (!idDetectado) {
        await manejarErrorConIA('pedir la carrera', texto);
        return;
      }

      const nombreCarrera = {
        1: 'Ingeniería Agroempresarial',
        2: 'Ingeniería Eléctrica',
        3: 'Ingeniería en Redes y Telecomunicaciones',
        4: 'Ingeniería Industrial'
      }[idDetectado];

      setIdCarrera(idDetectado);
      setMessages((prev) => [...prev,
        { role: 'assistant', content: `Carrera detectada: **${nombreCarrera}**` },
        { role: 'assistant', content: '¿Has cursado alguna materia? (sí/no)' }
      ]);
      setEstado('inicio');
      return;
    }

    if (estado === 'inicio') {
      if (textoLower.includes('sí') || textoLower.includes('si')) {
        setEstado('pedir_materias');
        setMessages((prev) => [...prev, { role: 'assistant', content: '¿Cuáles materias has cursado? Escríbelas separadas por coma.' }]);
      } else if (textoLower.includes('no')) {
        setEstado('pedir_max');
        setMessages((prev) => [...prev, { role: 'assistant', content: '¿Cuántas materias deseas cursar por cuatrimestre?' }]);
      } else {
        await manejarErrorConIA('preguntar si ha cursado materias (sí o no)', texto);
      }
      return;
    }

    if (estado === 'pedir_materias') {
      if (!texto.includes(',')) {
        await manejarErrorConIA('pedir las materias cursadas separadas por coma', texto);
        return;
      }

      const posibles = texto.split(',').map(m => m.trim());
      setMateriasCursadas(posibles);
      setEstado('pedir_max');
      setMessages((prev) => [...prev, { role: 'assistant', content: '¿Cuántas materias deseas cursar por cuatrimestre?' }]);
      return;
    }


    if (estado === 'pedir_max') {
      const num = parseInt(texto);
      if (isNaN(num) || num <= 0) {
        await manejarErrorConIA('pedir cuántas materias desea cursar por cuatrimestre (un número mayor a 0)', texto);
        return;
      }

      setMaxMateriasUsuario(num);
      setEstado('final');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Calculando ruta crítica basada en tus datos...' }]);

      const correo = localStorage.getItem('correo');

      try {
        const response = await axios.get('http://localhost:3000/api/estudiante-id', {
          params: { correo }
        });
        const estudianteId = response.data.id;

        await axios.post(`${import.meta.env.VITE_API_URL}/api/guardar-datos-chatbot`, {
          estudiante_id: estudianteId,
          carrera_id: idCarrera,
          materiasCursadas: materiasCursadas
        });


       const [rutaCritica, prerrequisitos] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/ruta-critica/${idCarrera}?limitePorCuatrimestre=${num}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/prerrequisitos`)
        ]);

        const cuatrimestres = rutaCritica.data?.ruta;

        if (!Array.isArray(cuatrimestres) || !cuatrimestres.every(c => Array.isArray(c))) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Error: la ruta crítica recibida no tiene la estructura esperada.'
          }]);
          return;
        }

        const materias = cuatrimestres.flatMap(cuatri => Array.isArray(cuatri) ? cuatri : []);

        const normalizar = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        const materiasFiltradas = materias.filter(m =>
          !materiasCursadas.some(mc => normalizar(mc) === normalizar(m.nombre_materia))
        );

        const organizadas = [];
        let i = 0;
        while (i < materiasFiltradas.length) {
          organizadas.push(materiasFiltradas.slice(i, i + num));
          i += num;
        }

        organizadas.forEach((cuatri, idx) => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `**Cuatrimestre ${idx + 1}:**\n` + cuatri.map(m => '- ' + m.nombre_materia).join('\n')
          }]);
        });

        if (Array.isArray(rutaCritica.data?.rutaCritica)) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '**Ruta Crítica Completa:**\n' + rutaCritica.data.rutaCritica.map(m => '- ' + m.nombre_materia).join('\n')
          }]);
        }

        if (Array.isArray(prerrequisitos.data)) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '**Prerrequisitos de Graduación:**\n' + prerrequisitos.data.map(p => '- ' + p.descripcion).join('\n')
          }]);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Recuerda que los prerrequisitos son materias que debes aprobar antes de cursar otras. Asegúrate de cumplir con ellos para evitar inconvenientes en tu trayectoria académica. Muchas gracias por usar SmartGrade.'
          }]);
        }
    setEstado('final');
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Hubo un error obteniendo la ruta crítica. Detalles técnicos: ' + (err.response?.data?.message || err.message)
        }]);
        console.error('Detalles del error SQL:', err.originalError || err);
      }
      return;
    }

    // Fallback general para preguntas al final del flujo (estado === 'final')
    try {
      const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [...messages, userMessage],
      }, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: openaiResponse.data.choices[0].message.content
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'No entendí tu mensaje y no pude consultar con la IA. Intenta reformular tu pregunta.'
      }]);
      console.error('Error llamando a OpenAI:', error);
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
              {msg.role === 'assistant'
                ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                : msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}
