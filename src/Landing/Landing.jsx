import React, { useState } from 'react';
import './Landing.css';

export default function Landing({ onStart }) {
    const [toggleChecked, setToggleChecked] = useState(false);

    const handleToggle = (e) => {
        const checked = e.target.checked;
        setToggleChecked(checked);
        if (checked) {
            setTimeout(() => onStart(), 500);
        }
    };

    return (
        <div className="landing-wrapper">
            <div className="landing">
                <div className="landing-header">
                    <h1 className="landing-title">Bienvenido a <span>SmartGrade</span></h1>
                    <div className="landing-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88"
                            viewBox="0 0 24 24" fill="none" stroke="yellow" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-stars">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M17.8 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z" />
                            <path d="M6.2 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z" />
                            <path d="M12 9.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z" />
                        </svg>
                    </div>
                </div>

                <p className="landing-subtitle">Tu asistente académico inteligente</p>

                <div className="features">
                    <div className="feature-box">
                        <div className="feature-header">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                                    className="icon icon-tabler icon-tabler-route-2">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                    <path d="M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4z" />
                                    <path d="M14 5a2 2 0 0 0 -2 2v10a2 2 0 0 1 -2 2" />
                                </svg>
                            </div>
                            <h3>Ruta Crítica</h3>
                        </div>
                        <p>Calcula la mejor secuencia para cursar tus materias según prerequisitos.</p>
                    </div>

                    <div className="feature-box">
                        <div className="feature-header">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                                    className="icon icon-tabler icon-tabler-input-ai">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M20 11v-2a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v5a2 2 0 0 0 2 2h4" />
                                    <path d="M14 21v-4a2 2 0 1 1 4 0v4" />
                                    <path d="M14 19h4" />
                                    <path d="M21 15v6" />
                                </svg>
                            </div>
                            <h3>Inteligencia Artificial</h3>
                        </div>
                        <p>Interactúa con un chatbot que entiende tus necesidades académicas.</p>
                    </div>

                    <div className="feature-box">
                        <div className="feature-header">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="icon icon-tabler icon-tabler-school">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
                                    <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
                                </svg>
                            </div>
                            <h3>Progreso Estudiantil</h3>
                        </div>
                        <p>Visualiza tu avance cuatrimestre a cuatrimestre hasta la graduación.</p>
                    </div>
                </div>

                <p className="toggle-text">Presiona la palanca para iniciar</p>

                <div className="toggle-container">
                    <input
                        className="toggle-input"
                        type="checkbox"
                        checked={toggleChecked}
                        onChange={handleToggle}
                    />
                    <div className="toggle-handle-wrapper">
                        <div className="toggle-handle">
                            <div className="toggle-handle-knob"></div>
                            <div className="toggle-handle-bar-wrapper">
                                <div className="toggle-handle-bar"></div>
                            </div>
                        </div>
                    </div>
                    <div className="toggle-base">
                        <div className="toggle-base-inside"></div>
                    </div>
                </div>
            </div>

            <footer className="landing-footer">
                <p>&copy; 2025 - Todos los derechos reservados. Proyecto desarrollado por: Doris Castro Jiménez, Prisila Noboa Fructuoso y Albert Cordero Parra</p>
            </footer>
        </div>
    );
}
