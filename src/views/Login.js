function renderLogin(container) {
    const savedUser = localStorage.getItem('lastTrainerUser') || '';
    const defaultButton = '<i data-lucide="lock" style="width:18px;"></i> Entrar a mi espacio';

    container.innerHTML = `
        <div class="login-module fade-in">
            <section class="login-shell">
                <div class="login-copy glass-card">
                    <div class="login-copy-badge">Xiaomi Trainer Intranet</div>
                    <h1 class="login-copy-title">La capa interna para formadores que necesitan foco, ritmo y visibilidad.</h1>
                    <p class="login-copy-text">Accede a tu dashboard operativo, registra actividad, revisa histórico y mantén el pulso del equipo con una experiencia clara y premium.</p>
                    <div class="login-copy-grid">
                        <article class="login-copy-item">
                            <i data-lucide="layout-dashboard"></i>
                            <strong>Dashboard vivo</strong>
                            <span>Métricas, tendencia semanal y filtros rápidos sin fricción.</span>
                        </article>
                        <article class="login-copy-item">
                            <i data-lucide="file-pen-line"></i>
                            <strong>Registro ágil</strong>
                            <span>Reportes listos para editar, duplicar y validar en segundos.</span>
                        </article>
                        <article class="login-copy-item">
                            <i data-lucide="smartphone"></i>
                            <strong>Lectura móvil</strong>
                            <span>Layout adaptado para iPhone y Android incluso en horizontal.</span>
                        </article>
                    </div>
                </div>

                <div class="glass-card login-card">
                    <div class="login-card-head">
                        <img src="./Xiaomi_logo_(2021-).svg.png" alt="Xiaomi Logo" class="login-logo">
                        <div>
                            <span class="login-eyebrow">Acceso seguro</span>
                            <h2 class="login-title">Bienvenido al workspace de training</h2>
                            <p class="login-subtitle">Selecciona tu usuario y entra a tu entorno de trabajo.</p>
                        </div>
                    </div>

                    <div class="login-highlights">
                        <span class="login-pill">SPA rápida</span>
                        <span class="login-pill">JSONP + GAS</span>
                        <span class="login-pill">Estado persistente</span>
                    </div>

                    <form id="loginForm" class="login-form">
                        <div class="form-group">
                            <label for="username" class="form-label">Usuario</label>
                            <select id="username" name="username" class="form-control" required>
                                <option value="" disabled selected>Cargando usuarios...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" id="password" name="password" class="form-control" placeholder="Introduce tu password corporativa" required autocomplete="current-password">
                        </div>

                        <button type="submit" id="btnSubmit" class="btn-primary login-submit">
                            ${defaultButton}
                        </button>

                        <small id="errorMsg" class="login-error"></small>
                    </form>
                </div>
            </section>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    const form = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    const btnSubmit = document.getElementById('btnSubmit');
    const userSelect = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    let userPicker = null;

    const setError = (message) => {
        errorMsg.textContent = message || '';
        errorMsg.style.display = message ? 'block' : 'none';
    };

    const setLoading = (loading) => {
        btnSubmit.disabled = loading;
        btnSubmit.innerHTML = loading
            ? '<i data-lucide="loader-circle" class="spin-icon" style="width:18px;"></i> Validando acceso...'
            : defaultButton;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    sendJSONP('getUsersList').then((res) => {
        if (res.status !== 'success' || !Array.isArray(res.data)) {
            userSelect.innerHTML = '<option value="" disabled selected>Error de red</option>';
            return;
        }

        userSelect.innerHTML = '<option value="">Selecciona tu cuenta</option>';
        res.data.forEach((userName) => {
            const option = document.createElement('option');
            option.value = userName;
            option.textContent = userName;
            userSelect.appendChild(option);
        });

        if (typeof TomSelect !== 'undefined') {
            userPicker = new TomSelect('#username', {
                create: false,
                maxOptions: 150,
                placeholder: 'Busca tu usuario',
                sortField: [{ field: 'text', direction: 'asc' }],
                onChange: () => {
                    setError('');
                    passwordInput.focus();
                }
            });
        }

        if (savedUser) {
            if (userPicker) userPicker.setValue(savedUser, true);
            else userSelect.value = savedUser;
        }
    }).catch(() => {
        userSelect.innerHTML = '<option value="" disabled selected>Sin conexión</option>';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = userPicker ? userPicker.getValue() : userSelect.value;
        const pass = passwordInput.value.trim();

        if (!user) {
            setError('Selecciona un usuario antes de continuar.');
            return;
        }
        if (!pass) {
            setError('Introduce tu password para iniciar sesión.');
            passwordInput.focus();
            return;
        }

        setLoading(true);
        setError('');

        sendJSONP('login', { user, pass }).then((res) => {
            if (res.status === 'success') {
                localStorage.setItem('lastTrainerUser', res.user || user);
                setSessionData({ user: res.user, name: res.name, role: res.role, sede: res.sede, email: res.email });
                navigate('#dashboard');
                return;
            }

            setLoading(false);
            setError(res.message || 'Usuario o password incorrectos.');
        }).catch(() => {
            setLoading(false);
            setError('No se ha podido conectar con el servidor. Inténtalo de nuevo.');
        });
    });
}

window.renderLogin = renderLogin;
