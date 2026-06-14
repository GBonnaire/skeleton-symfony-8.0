export function isChildren(parent, child) {
    if(child == parent) {
        return true;
    }
    if(child == document.body) {
        return false;
    }
    if(child.parentNode) {
        return isChildren(parent, child.parentNode);
    } else {
        return false;
    }
}

export function isDomLoaded() {
    if(document.readyState === "complete") {
        return true;
    }
    return false;
}

export function isOnMobile() {
    if(getWindowWidth() < 576) {
        return true;
    } else {
        return false;
    }
}

export function getWindowWidth() {
    if(screen && screen.width) {
        return screen.width;
    }
    const w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth;
    return x;
}

export function getWindowHeight() {
    const w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        y = w.innerHeight || e.clientHeight || g.clientHeight;
    return y;
}

export function trim(text, search, type) {
    if(!search) {
        search = "s";
    }
    if(!type) {
        type = "both";
    }
    if(type === "left" || type === "both") {
        text = text.replace(new RegExp("^[" + search + "]+"), "");
    }
    if(type === "right" || type === "both") {
        text = text.replace(new RegExp("[" + search + "]+$"), "");
    }
    return text.trim();
}

export function guid(format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') {
    return format.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function password(length, minLowercase, minUppercase, minNumbers, minSpecialChars, specialChars = "!@#$%^&*()_+[]{}|;:,.<>?") {
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    const chars = lowercaseChars + uppercaseChars + numbers + specialChars;
    length = Math.max(length, minLowercase + minUppercase + minNumbers + minSpecialChars);

    let pwd = "";

    function getRandomCharacters(charSet, count) {
        let result = "";
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * charSet.length);
            result += charSet[randomIndex];
        }
        return result;
    }

    pwd += getRandomCharacters(lowercaseChars, minLowercase);
    pwd += getRandomCharacters(uppercaseChars, minUppercase);
    pwd += getRandomCharacters(numbers, minNumbers);
    pwd += getRandomCharacters(specialChars, minSpecialChars);

    const remainingLength = length - pwd.length;

    if (remainingLength > 0) {
        pwd += getRandomCharacters(chars, remainingLength);
    }

    pwd = pwd.split('').sort(() => Math.random() - 0.5).join('');

    return pwd;
}

export function downloadImage(uri, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}
