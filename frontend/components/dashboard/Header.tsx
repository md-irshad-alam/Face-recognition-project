'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FaBars, FaSearch, FaBell, FaUserCircle } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

// --- Styled Components ---

const AvatarPlaceholder = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #6366F1;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1rem;
`

const DropdownMenu = styled.div`
    position: absolute;
    top: 50px;
    right: 0;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 0.5rem;
    min-width: 150px;
    z-index: 50;
    border: 1px solid #E5E7EB;
`

const DropdownItem = styled.div`
    padding: 0.5rem 1rem;
    color: #374151;
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 0.25rem;
    
    &:hover {
        background-color: #F3F4F6;
        color: #1F2937;
    }
`


// --- Styled Components ---
const TopBarContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  background-color: #FFFFFF;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: #F3F4F6;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  width: 400px;
  gap: 0.5rem;
  color: #6B7280;

  input {
    border: none;
    background: transparent;
    outline: none;
    flex: 1;
    font-size: 0.95rem;
    color: #1F2937;
    
    &::placeholder {
      color: #9CA3AF;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`

const ExpandButton = styled.button`
    display: none;
    @media (max-width: 1024px) {
        display: block;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
    }
`

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .info {
    display: flex;
    flex-direction: column;
    
    .name {
      font-weight: 600;
      font-size: 0.9rem;
    }
    .role {
        font-size: 0.75rem;
        color: #6B7280;
    }
  }
`

// --- Component ---
interface HeaderProps {
  toggleSidebar: () => void
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const checkLogin = () => {
        const token = localStorage.getItem('token')
        const name = localStorage.getItem('user_name')
        const email = localStorage.getItem('user_email')
        if (token && name) {
            setIsLoggedIn(true)
            setUserName(name)
            setUserEmail(email || '')
        } else {
            setIsLoggedIn(false)
            setUserName('')
            setUserEmail('')
        }
    }
    
    checkLogin()
    window.addEventListener('storage', checkLogin)
    return () => window.removeEventListener('storage', checkLogin)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_email')
    setIsLoggedIn(false)
    setShowDropdown(false)
    window.dispatchEvent(new Event('storage'))
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : '??'
  }

  return (
    <TopBarContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ExpandButton onClick={toggleSidebar}>
            <FaBars />
        </ExpandButton>
        <SearchBar>
            <FaSearch />
            <input type="text" placeholder="Search for student, teacher or document" />
        </SearchBar>
      </div>
      
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
        <FaBell style={{ fontSize: '1.2rem', cursor: 'pointer' }} />
        
        {isLoggedIn ? (
            <div style={{ position: 'relative' }}>
                <UserProfile onClick={() => setShowDropdown(!showDropdown)} style={{ cursor: 'pointer' }}>
                    <AvatarPlaceholder>{getInitials(userName)}</AvatarPlaceholder>
                    <div className="info">
                        <span className="name">{userName}</span>
                        <span className="role">{userEmail}</span>
                    </div>
                </UserProfile>
                
                {showDropdown && (
                    <DropdownMenu>
                        <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                    </DropdownMenu>
                )}
            </div>
        ) : (
            <UserProfile onClick={() => window.location.href = '/login'} style={{ cursor: 'pointer' }}>
                <FaUserCircle style={{ fontSize: '2.5rem', color: '#9CA3AF' }} />
                <div className="info">
                    <span className="name">Guest</span>
                    <span className="role">Login</span>
                </div>
            </UserProfile>
        )}
      </div>
    </TopBarContainer>
  )
}
