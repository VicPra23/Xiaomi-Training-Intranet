function renderLogin(container) {
    const savedUser = localStorage.getItem('lastTrainerUser') || '';
    const defaultButton = '<i data-lucide="lock" style="width:18px;"></i> Login';

    container.innerHTML = `
        <div class="login-module fade-in login-module-compact">
            <section class="login-shell login-shell-compact">
                <div class="glass-card login-card login-card-compact">
                    <div class="login-card-head login-card-head-compact">
                        <img src="./Xiaomi_logo_(2021-).svg.png" alt="Xiaomi Logo" class="login-logo">
                        <div>
                            <h2 class="login-title">Xiaomi Trainer Intranet</h2>
                            <p class="login-subtitle">Acceso interno.</p>
                        </div>
                    </div>

                    <form id="loginForm" class="login-form">
                        <div class="form-group">
                            <label for="username" class="form-label">Perfil</label>
                            <select id="username" name="username" class="form-control" required>
                                <option value="" disabled selected>Cargando perfiles...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="password" class="form-label">Contraseña</label>
                            <input type="password" id="password" name="password" class="form-control" placeholder="Introduce tu contraseña" required autocomplete="current-password">
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
            ? '<i data-lucide="loader-circle" class="spin-icon" style="width:18px;"></i> Validando...'
            : defaultButton;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    sendJSONP('getUsersList').then((res) => {
        if (res.status !== 'success' || !Array.isArray(res.data)) {
            userSelect.innerHTML = '<option value="" disabled selected>Error de red</option>';
            return;
        }

        userSelect.innerHTML = '<option value="">Selecciona tu perfil</option>';
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
                placeholder: 'Busca tu perfil',
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
            setError('Selecciona un perfil antes de continuar.');
            return;
        }
        if (!pass) {
            setError('Introduce tu contraseña.');
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
            setError(res.message || 'Perfil o contraseña incorrectos.');
        }).catch(() => {
            setLoading(false);
            setError('No se ha podido conectar con el servidor. Inténtalo de nuevo.');
        });
    });
}

window.renderLogin = renderLogin;
