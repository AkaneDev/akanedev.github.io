// Global Theme Manager for the entire site
class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'akanedev-site-theme';
        this.STORAGE_COLORS_KEY = 'akanedev-site-colors';
        this.defaultThemes = {
            default: {
                primary: '#0ff',
                accent: '#0f0',
                dark: '#222',
                light: '#333',
                background: '#121212',
                text: '#ffffff',
                border: '#444'
            },
            dark: {
                primary: '#0ff',
                accent: '#0f0',
                dark: '#1a1a1a',
                light: '#2a2a2a',
                background: '#0a0a0a',
                text: '#ffffff',
                border: '#333'
            },
            light: {
                primary: '#0066cc',
                accent: '#00cc00',
                dark: '#f0f0f0',
                light: '#e0e0e0',
                background: '#ffffff',
                text: '#000000',
                border: '#cccccc'
            },
            purple: {
                primary: '#b24bff',
                accent: '#ff00ff',
                dark: '#2a1a3a',
                light: '#3a2a4a',
                background: '#0f0815',
                text: '#e0d5ff',
                border: '#5a3a7a'
            },
            ocean: {
                primary: '#00d4ff',
                accent: '#00ff88',
                dark: '#001a33',
                light: '#003366',
                background: '#000b1a',
                text: '#b3e5fc',
                border: '#004d7a'
            },
            boom: {
                primary: '#fdd1e9',
                accent: '#fedcee',
                dark: '#3d2a35',
                light: '#4d3a45',
                background: '#2a1f27',
                text: '#fde8f5',
                border: '#6d5a65'
            }
        };
        
        this.init();
    }

    init() {
        this.loadTheme();
        this.createThemePicker();
    }

    setTheme(themeName) {
        const theme = this.defaultThemes[themeName] || this.defaultThemes.default;
        this.applyTheme(theme);
        localStorage.setItem(this.STORAGE_KEY, themeName);
        localStorage.removeItem(this.STORAGE_COLORS_KEY); // Clear custom colors
        this.updateThemePickerUI(themeName);
    }

    setCustomTheme(colors) {
        this.applyTheme(colors);
        localStorage.setItem(this.STORAGE_KEY, 'custom');
        localStorage.setItem(this.STORAGE_COLORS_KEY, JSON.stringify(colors));
        this.updateThemePickerUI('custom');
    }

    getCustomColors() {
        const saved = localStorage.getItem(this.STORAGE_COLORS_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    applyTheme(theme) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--accent-color', theme.accent);
        root.style.setProperty('--primary-dark', theme.dark);
        root.style.setProperty('--primary-light', theme.light);
        root.style.setProperty('--bg-color', theme.background);
        root.style.setProperty('--text-color', theme.text);
        root.style.setProperty('--border-color', theme.border);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'default';
        
        if (savedTheme === 'custom') {
            const customColors = this.getCustomColors();
            if (customColors) {
                this.applyTheme(customColors);
            } else {
                this.setTheme('default');
            }
        } else {
            const theme = this.defaultThemes[savedTheme] || this.defaultThemes.default;
            this.applyTheme(theme);
        }
    }

    createThemePicker() {
        // Find or create theme picker in navbar
        let picker = document.getElementById('theme-picker-container');
        
        if (!picker) {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                picker = document.createElement('div');
                picker.id = 'theme-picker-container';
                picker.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; margin: 0 1rem;';
                
                const button = document.createElement('button');
                button.id = 'theme-toggle-button';
                button.textContent = '🎨';
                button.style.cssText = 'background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color); padding: 0.5rem 0.75rem; border-radius: 3px; cursor: pointer; transition: all 0.3s;';
                button.addEventListener('click', () => this.toggleThemePicker());
                
                picker.appendChild(button);
                navbar.appendChild(picker);
            }
        }

        // Create modal if it doesn't exist
        if (!document.getElementById('theme-picker-modal')) {
            this.createThemePickerModal();
        }
    }

    createThemePickerModal() {
        const modal = document.createElement('div');
        modal.id = 'theme-picker-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 60px;
            right: 20px;
            background: var(--primary-dark, #222);
            border: 2px solid var(--primary-color, #0ff);
            border-radius: 8px;
            padding: 1rem;
            z-index: 10000;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            color: var(--text-color);
        `;

        const title = document.createElement('h3');
        title.textContent = 'Customize Theme';
        title.style.cssText = 'margin: 0 0 1rem 0; color: var(--primary-color);';
        modal.appendChild(title);

        // Preset themes
        const presetsLabel = document.createElement('div');
        presetsLabel.textContent = 'Presets:';
        presetsLabel.style.cssText = 'margin-bottom: 0.5rem; font-weight: bold;';
        modal.appendChild(presetsLabel);

        const presetsContainer = document.createElement('div');
        presetsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;';
        
        Object.keys(this.defaultThemes).forEach(themeName => {
            const btn = document.createElement('button');
            btn.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
            btn.style.cssText = `
                padding: 0.5rem;
                background: transparent;
                border: 1px solid var(--primary-color);
                color: var(--primary-color);
                cursor: pointer;
                border-radius: 3px;
                transition: all 0.3s;
                font-size: 0.9rem;
            `;
            btn.addEventListener('click', () => {
                this.setTheme(themeName);
                this.updateColorPickers();
            });
            presetsContainer.appendChild(btn);
        });
        modal.appendChild(presetsContainer);

        // Custom colors
        const customLabel = document.createElement('div');
        customLabel.textContent = 'Custom Colors:';
        customLabel.style.cssText = 'margin: 1rem 0 0.5rem 0; font-weight: bold;';
        modal.appendChild(customLabel);

        const colorPickerGroups = [
            { id: 'primary', label: 'Primary Color' },
            { id: 'accent', label: 'Accent Color' },
            { id: 'dark', label: 'Dark Background' },
            { id: 'light', label: 'Light Background' },
            { id: 'background', label: 'Main Background' },
            { id: 'text', label: 'Text Color' }
        ];

        const colorsContainer = document.createElement('div');
        colorsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';

        colorPickerGroups.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';

            const label = document.createElement('label');
            label.textContent = group.label;
            label.style.cssText = 'min-width: 120px; font-size: 0.9rem;';

            const input = document.createElement('input');
            input.type = 'color';
            input.id = `color-picker-${group.id}`;
            input.style.cssText = 'width: 50px; height: 35px; border: 1px solid var(--border-color); border-radius: 3px; cursor: pointer;';
            input.addEventListener('input', (e) => {
                this.updateCustomColor(group.id, e.target.value);
            });

            groupDiv.appendChild(label);
            groupDiv.appendChild(input);
            colorsContainer.appendChild(groupDiv);
        });

        modal.appendChild(colorsContainer);

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset to Default';
        resetBtn.style.cssText = `
            margin-top: 1rem;
            width: 100%;
            padding: 0.5rem;
            background: transparent;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            cursor: pointer;
            border-radius: 3px;
            transition: all 0.3s;
        `;
        resetBtn.addEventListener('click', () => {
            this.setTheme('default');
            this.updateColorPickers();
        });
        modal.appendChild(resetBtn);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: transparent;
            border: none;
            color: var(--primary-color);
            cursor: pointer;
            font-size: 1.5rem;
        `;
        closeBtn.addEventListener('click', () => this.toggleThemePicker());
        modal.appendChild(closeBtn);

        document.body.appendChild(modal);
        this.updateColorPickers();

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#theme-picker-container') && !e.target.closest('#theme-picker-modal')) {
                modal.style.display = 'none';
            }
        });
    }

    updateColorPickers() {
        const currentTheme = localStorage.getItem(this.STORAGE_KEY) || 'default';
        let theme;

        if (currentTheme === 'custom') {
            theme = this.getCustomColors() || this.defaultThemes.default;
        } else {
            theme = this.defaultThemes[currentTheme] || this.defaultThemes.default;
        }

        const colorPickerGroups = [
            { id: 'primary' },
            { id: 'accent' },
            { id: 'dark' },
            { id: 'light' },
            { id: 'background' },
            { id: 'text' }
        ];

        colorPickerGroups.forEach(group => {
            const input = document.getElementById(`color-picker-${group.id}`);
            if (input) {
                input.value = theme[group.id] || '#000000';
            }
        });
    }

    updateCustomColor(colorId, value) {
        const customColors = this.getCustomColors() || { ...this.defaultThemes.default };
        customColors[colorId] = value;
        this.setCustomTheme(customColors);
    }

    toggleThemePicker() {
        const modal = document.getElementById('theme-picker-modal');
        if (modal) {
            modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}
