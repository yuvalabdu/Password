// script.js
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const iconShow = document.getElementById('icon-show');
    const iconHide = document.getElementById('icon-hide');
    const strengthMeterFill = document.getElementById('strength-meter-fill');
    const strengthText = document.getElementById('strength-text');
    const scoreText = document.getElementById('score-text');
    const meterCircle = document.querySelector('.meter-circle');

    const checks = {
        length: document.getElementById('check-length'),
        uppercase: document.getElementById('check-uppercase'),
        lowercase: document.getElementById('check-lowercase'),
        numbers: document.getElementById('check-numbers'),
        special: document.getElementById('check-special'),
        common: document.getElementById('check-common'),
        repeat: document.getElementById('check-repeat'),
        seq: document.getElementById('check-seq'),
    };

    // Generator elements
    const generatedPasswordInput = document.getElementById('generated-password');
    const copyBtn = document.getElementById('copy-password');
    const lengthSlider = document.getElementById('length-slider');
    const lengthVal = document.getElementById('length-val');
    const genUpper = document.getElementById('gen-upper');
    const genLower = document.getElementById('gen-lower');
    const genNumbers = document.getElementById('gen-numbers');
    const genSymbols = document.getElementById('gen-symbols');
    const btnGenerate = document.getElementById('btn-generate');

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        iconShow.style.display = isPassword ? 'none' : 'block';
        iconHide.style.display = isPassword ? 'block' : 'none';
    });

    // Evaluate password on input
    passwordInput.addEventListener('input', () => {
        evaluatePassword(passwordInput.value);
    });
    
    // Evaluate initial empty state
    evaluatePassword('');

    function evaluatePassword(password) {
        // Validation rules
        const rules = {
            hasLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumbers: /[0-9]/.test(password),
            hasSpecial: /[^A-Za-z0-9\s]/.test(password),
            hasSpaces: /\s/.test(password),
            isCommon: false,
            hasRepeat: false,
            hasSeq: false
        };
        
        if (password) {
            rules.hasRepeat = /(.)\1{2,}/.test(password);
            
            const lowerPass = password.toLowerCase();
            const sequences = ['123456', 'abcdef', 'qwerty', 'asdfgh', '012345'];
            for (let seq of sequences) {
                if (lowerPass.includes(seq)) {
                    rules.hasSeq = true;
                    break;
                }
            }
            
            const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'abc123'];
            for (let common of commonPasswords) {
                if (lowerPass.includes(common)) {
                    rules.isCommon = true;
                    break;
                }
            }
        }

        // Update checklist UI
        updateChecklistItem(checks.length, rules.hasLength);
        updateChecklistItem(checks.uppercase, rules.hasUppercase);
        updateChecklistItem(checks.lowercase, rules.hasLowercase);
        updateChecklistItem(checks.numbers, rules.hasNumbers);
        updateChecklistItem(checks.special, rules.hasSpecial);
        
        // These are true if they DON'T have the negative trait, OR if password is empty
        updateChecklistItem(checks.common, !rules.isCommon);
        updateChecklistItem(checks.repeat, !rules.hasRepeat);
        updateChecklistItem(checks.seq, !rules.hasSeq);

        if (!password) {
            updateMeterUI(0, 'Very Weak', false);
            return;
        }

        const score = calculateScore(password, rules);
        const level = determineLevel(score);

        updateMeterUI(score, level, true);
    }

    function calculateScore(password, rules) {
        let score = 0;

        // Base Points (Max 100)
        if (rules.hasLength) score += 20;
        if (rules.hasUppercase) score += 20;
        if (rules.hasLowercase) score += 20;
        if (rules.hasNumbers) score += 20;
        if (rules.hasSpecial) score += 20;

        // Bonus Points for extra length
        if (password.length >= 12) score += 10;
        if (password.length >= 16) score += 10;

        // Penalties
        if (rules.hasSpaces) score -= 30; // No spaces allowed
        if (rules.hasRepeat) score -= 20;
        if (rules.hasSeq) score -= 30;
        if (rules.isCommon) score -= 40;
        
        // Cap score if required baseline is not met
        if (!rules.hasLength) {
            score = Math.min(score, 30); 
        }

        // Clamp score between 0 and 100
        return Math.max(0, Math.min(100, score));
    }

    function determineLevel(score) {
        if (score <= 30) return 'Very Weak';
        if (score <= 50) return 'Weak';
        if (score <= 70) return 'Fair';
        if (score < 90) return 'Good';
        return 'Strong';
    }

    function updateChecklistItem(element, isValid) {
        const iconSpan = element.querySelector('span');
        if (isValid) {
            element.classList.remove('invalid');
            element.classList.add('valid');
            iconSpan.textContent = '✔';
        } else {
            element.classList.remove('valid');
            element.classList.add('invalid');
            iconSpan.textContent = '✖';
        }
    }

    function updateMeterUI(score, level, hasText) {
        scoreText.textContent = score;
        
        // Provide a small visual indicator for very low scores if text exists
        const displayScore = (score < 5 && hasText) ? 5 : score;
        strengthMeterFill.style.width = `${displayScore}%`;
        strengthText.textContent = level;

        // Reset classes
        strengthMeterFill.className = 'strength-meter-fill';
        strengthText.className = 'strength-text meter-label';

        let colorVar = 'var(--color-very-weak)';

        if (hasText) {
            const levelClass = level.toLowerCase().replace(' ', '-');
            strengthMeterFill.classList.add(levelClass);
            strengthText.classList.add(`${levelClass}-text`);
            
            if (level === 'Very Weak') colorVar = 'var(--color-very-weak)';
            else if (level === 'Weak') colorVar = 'var(--color-weak)';
            else if (level === 'Fair') colorVar = 'var(--color-fair)';
            else if (level === 'Good') colorVar = 'var(--color-good)';
            else if (level === 'Strong') colorVar = 'var(--color-strong)';
        }
        
        meterCircle.style.borderTopColor = colorVar;
        scoreText.style.color = colorVar;
    }
    
    // Generator Logic
    lengthSlider.addEventListener('input', (e) => {
        lengthVal.textContent = e.target.value;
    });
    
    btnGenerate.addEventListener('click', () => {
        const length = parseInt(lengthSlider.value);
        const includeUpper = genUpper.checked;
        const includeLower = genLower.checked;
        const includeNumbers = genNumbers.checked;
        const includeSymbols = genSymbols.checked;
        
        if (!includeUpper && !includeLower && !includeNumbers && !includeSymbols) {
            // If nothing is checked, default to lowercase
            genLower.checked = true;
            generateAndApply(length, false, true, false, false);
            return;
        }
        
        generateAndApply(length, includeUpper, includeLower, includeNumbers, includeSymbols);
    });
    
    function generateAndApply(length, upper, lower, numbers, symbols) {
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
        
        let allowedChars = '';
        if (upper) allowedChars += uppercaseChars;
        if (lower) allowedChars += lowercaseChars;
        if (numbers) allowedChars += numberChars;
        if (symbols) allowedChars += symbolChars;
        
        let password = '';
        
        // Ensure at least one of each selected type is included
        const requiredChars = [];
        if (upper) requiredChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
        if (lower) requiredChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
        if (numbers) requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
        if (symbols) requiredChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
        
        password += requiredChars.join('');
        
        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += allowedChars[Math.floor(Math.random() * allowedChars.length)];
        }
        
        // Shuffle the password
        password = password.split('').sort(() => 0.5 - Math.random()).join('');
        
        generatedPasswordInput.value = password;
        passwordInput.value = password;
        
        // Evaluate the new password
        evaluatePassword(password);
    }
    
    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const text = generatedPasswordInput.value;
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                const originalColor = copyBtn.style.color;
                copyBtn.style.color = 'var(--success)';
                setTimeout(() => {
                    copyBtn.style.color = originalColor;
                }, 1500);
            });
        }
    });
});
