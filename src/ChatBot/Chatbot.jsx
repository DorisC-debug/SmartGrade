import React from 'react';
import './Chatbot.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [messages, setMessages] = React.useState([
    { role: 'assistant', content: 'Hola, soy SmartGrade, tu asistente académico.' },
    { role: 'assistant', content: '¿Cuál es tu carrera? (Ej: ingeniería industrial)' }
  ]);
  const [input, setInput] = React.useState('');
  const [idCarrera, setIdCarrera] = React.useState(null);
  const [materiasCursadas, setMateriasCursadas] = React.useState([]);
  const [maxMateriasUsuario, setMaxMateriasUsuario] = React.useState(null);
  const [estado, setEstado] = React.useState('pedir_carrera');

  const detectarIdCarrera = (texto) => {
    const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (t.includes('agro')) return 1;
    if (t.includes('electri')) return 2;
    if (t.includes('red') || t.includes('tele')) return 3;
    if (t.includes('indus')) return 4;
    return null;
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
        setMessages((prev) => [...prev, { role: 'assistant', content: 'No pude identificar la carrera. Intenta escribir algo parecido a: ingeniería industrial, eléctrica, etc.' }]);
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
      } else {
        setEstado('pedir_max');
        setMessages((prev) => [...prev, { role: 'assistant', content: '¿Cuántas materias deseas cursar por cuatrimestre?' }]);
      }
      return;
    }

    if (estado === 'pedir_materias') {
      const posibles = texto.split(',').map(m => m.trim());
      setMateriasCursadas(posibles);
      setEstado('pedir_max');
      setMessages((prev) => [...prev, { role: 'assistant', content: '¿Cuántas materias deseas cursar por cuatrimestre?' }]);
      return;
    }

   if (estado === 'pedir_max') {
  const num = parseInt(texto);
  if (isNaN(num) || num <= 0) {
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Por favor escribe un número válido mayor a 0.' }]);
    return;
  }

  setMaxMateriasUsuario(num);
  setEstado('final');
  setMessages((prev) => [...prev, { role: 'assistant', content: 'Calculando ruta crítica basada en tus datos...' }]);
   console.log('Materias cursadas:', materiasCursadas);
  console.log('idCarrera:',idCarrera);

  const correo = localStorage.getItem('correo')
 
  try {
  const response = await axios.get('http://localhost:3000/api/estudiante-id', {
    params: { correo }
  });

  const estudianteId = response.data.id;

  console.log("Materias cursadas:", materiasCursadas);
  console.log("idCarrera:", idCarrera);
  console.log("correo:", correo);

  await axios.post('http://localhost:3000/api/guardar-datos-chatbot', {
    estudiante_id: estudianteId,
    carrera_id: idCarrera,
    materiasCursadas: materiasCursadas
  });


      console.log('✅ Datos de carrera y materias guardados');



    const [rutaCritica, prerrequisitos] = await Promise.all([
      axios.get(`http://localhost:3000/api/ruta-critica/${idCarrera}?limitePorCuatrimestre=${num}`),
      axios.get('http://localhost:3000/api/prerrequisitos')
    ]);

    console.log('Datos recibidos ruta:', rutaCritica.data);
    console.log('Datos recibidos ruta crítica:', rutaCritica.data.rutaCritica);



    const cuatrimestres = rutaCritica.data?.ruta;

    // Validación de estructura
    if (!Array.isArray(cuatrimestres) || !cuatrimestres.every(c => Array.isArray(c))) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Error: la ruta crítica recibida no tiene la estructura esperada.'
        }]);
        return;
      }

    for (let i = 0; i < cuatrimestres.length; i++) {
      if (!Array.isArray(cuatrimestres[i])) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: El cuatrimestre ${i + 1} no es una lista válida de materias.`
        }]);
        return;
      }
    }

    // Validación de número de materias por cuatrimestre
    if (typeof num !== 'number' || num <= 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: El número de materias por cuatrimestre no es válido.'
      }]);
      return;
    }

    const materias = cuatrimestres.flatMap(cuatri => Array.isArray(cuatri) ? cuatri : []);

    // Filtrado de materias cursadas con normalización
    const normalizar = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    const materiasFiltradas = materias.filter(m =>
      !materiasCursadas.some(mc => normalizar(mc) === normalizar(m.nombre_materia))
    );

    // Agrupación en cuatrimestres según el límite establecido
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

    
    // Mostrar ruta crítica completa original
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
    }
  } catch (err) {
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: 'Hubo un error obteniendo la ruta crítica. Detalles técnicos: ' + (err.response?.data?.message || err.message)
  }]);
  console.error('Detalles del error SQL:', err.originalError || err); // ✅ corregido
}

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
