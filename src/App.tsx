import { useEffect } from 'react'
import AppRouter from '@/router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useThemeStore, applyThemeToDOM } from '@/stores/theme.store'

export default function App() {
  const theme = useThemeStore((state) => state.theme)

  // Đảm bảo DOM luôn duy trì chuẩn xác class 'dark' khi re-render
  useEffect(() => {
    applyThemeToDOM(theme)
  }, [theme])

  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </>
  )
}
