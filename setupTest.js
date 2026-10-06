import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)

if (!window.confirm) {
    window.confirm = () => true
}

if (!window.alert) {
    window.alert = () => {}
}


afterEach(() => {
    localStorage.clear()
})  
