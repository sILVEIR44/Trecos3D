import React, { createContext, useContext, useState, ReactNode } from 'react'

export const lightColors = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#222222',
  subtext: '#888888',
  border: '#E0E0E0',
  divider: '#F0F0F0',
  inputBg: '#FFFFFF',
  placeholder: '#AAAAAA',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
}

export const darkColors = {
  background: '#111111',
  card: '#1E1E1E',
  text: '#EEEEEE',
  subtext: '#999999',
  border: '#333333',
  divider: '#2A2A2A',
  inputBg: '#252525',
  placeholder: '#555555',
  tabBar: '#161616',
  tabBarBorder: '#2A2A2A',
}

export type Colors = typeof lightColors

interface ThemeContextData {
  isDark: boolean
  colors: Colors
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextData>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors: isDark ? darkColors : lightColors,
        toggleTheme: () => setIsDark(prev => !prev),
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
