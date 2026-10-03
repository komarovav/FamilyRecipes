import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import RecipeDetail from './pages/RecipeDetail'
import './App.css'
import { useAuth } from './context/AuthContext'

type Page = 'login' | 'register' | 'home' | 'recipe'

function App() {
  const { user, isLoading, logout } = useAuth()
  const [page, setPage] = useState<Page>('login')
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)

  if (isLoading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!user) {
    if (page === 'register') {
      return (
        <Register
          goLogin={() => setPage('login')}
          goHome={() => setPage('home')}
        />
      )
    }

    return (
      <Login
        goHome={() => setPage('home')}
        goRegister={() => setPage('register')}
      />
    )
  }

  if (page === 'recipe') {
    return (
      <RecipeDetail
        recipeId={selectedRecipeId}
        goHome={() => setPage('home')}
      />
    )
  }

  return (
    <Home
      logout={() => {
        logout()
        setPage('login')
      }}
      openRecipe={(recipeId) => {
        setSelectedRecipeId(recipeId)
        setPage('recipe')
      }}
    />
  )
}

export default App