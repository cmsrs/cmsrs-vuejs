import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/vue'
expect.extend(matchers)

if (!window.confirm) {
    window.confirm = () => true
}

if (!window.alert) {
    window.alert = () => {}
}


afterEach(() => {
    cleanup()
    localStorage.clear()
})  
