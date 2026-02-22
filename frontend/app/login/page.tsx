'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { FaGoogle, FaLinkedin, FaFacebook } from 'react-icons/fa'
import Image from 'next/image'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'; 

const Container = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    background-color: #F3F4F6;
    font-family: 'Inter', sans-serif;
`

const LeftSide = styled.div`
    flex: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-direction: column;
    padding: 2rem;
    
    @media (max-width: 768px) {
        display: none;
    }
`

const Branding = styled.div`
    text-align: center;
    h1 {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1rem;
    }
    p {
        font-size: 1.25rem;
        opacity: 0.9;
    }
    img {
        max-width: 80%;
        margin-top: 2rem;
        border-radius: 1rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
`

const RightSide = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 2rem;
`

const AuthCard = styled.div`
    width: 100%;
    max-width: 450px;
    padding: 2rem;
    
    h2 {
        font-size: 2rem;
        font-weight: 700;
        color: #1F2937;
        margin-bottom: 0.5rem;
    }
    
    p.subtitle {
        color: #6B7280;
        margin-bottom: 2rem;
    }
`

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
    
    label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
        margin-bottom: 0.5rem;
    }
    
    input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #D1D5DB;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: border-color 0.2s;
        
        &:focus {
            outline: none;
            border-color: #6366F1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
    }
`

const SubmitButton = styled.button`
    width: 100%;
    background-color: #6366F1;
    color: white;
    padding: 0.875rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-bottom: 1.5rem;
    
    &:hover {
        background-color: #4F46E5;
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`

const Divider = styled.div`
    display: flex;
    align-items: center;
    margin: 1.5rem 0;
    
    &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #E5E7EB;
    }
    
    span {
        padding: 0 1rem;
        color: #9CA3AF;
        font-size: 0.875rem;
    }
`

const SocialLogin = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
`

const SocialButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: 1px solid #E5E7EB;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    color: #6B7280;
    font-size: 1.25rem;
    
    &:hover {
        background-color: #F9FAFB;
        color: #1F2937;
        border-color: #D1D5DB;
    }
`

const ToggleText = styled.p`
    text-align: center;
    margin-top: 1.5rem;
    color: #6B7280;
    font-size: 0.875rem;
    
    button {
        background: none;
        border: none;
        color: #6366F1;
        font-weight: 600;
        cursor: pointer;
        margin-left: 0.5rem;
        
        &:hover {
            text-decoration: underline;
        }
    }
`

const ErrorMessage = styled.div`
    background-color: #FEE2E2;
    color: #DC2626;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
`

export default function LoginPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register'
            const payload = isLogin 
                ? { email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password, full_name: formData.name }
            
            const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            
            const data = await res.json()
            
            if (!res.ok) {
                throw new Error(data.detail || 'Authentication failed')
            }
            
            if (isLogin) {
                // Save token and user info
                localStorage.setItem('token', data.access_token)
                localStorage.setItem('user_name', data.user_name)
                localStorage.setItem('user_email', data.user_email)
                // Dispatch a custom event so Header updates immediately
                window.dispatchEvent(new Event('storage'))
                router.push('/') // Redirect to dashboard
            } else {
                // Verification or auto-login after register
                setIsLogin(true)
                setError("Registration successful! Please login.")
            }
            
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }
    
    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true)
        try {
             const res = await fetch(`http://127.0.0.1:8000/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            })
            
            const data = await res.json()
            
            if (!res.ok) {
                throw new Error(data.detail || 'Google Login failed')
            }
            
            localStorage.setItem('token', data.access_token)
            localStorage.setItem('user_name', data.user_name)
            localStorage.setItem('user_email', data.user_email)
            window.dispatchEvent(new Event('storage'))
            router.push('/')
            
        } catch (error: any) {
             setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <Container>
                <LeftSide>
                    <Branding>
                        <h1>Focus</h1>
                        <p>Smart Attendance Management System</p>
                        {/* Placeholder for illustration */}
                        <div >
                            <Image
                                      
                                      src="/login_icon.png"
                                alt="Login Icon"
                                height={300}
                                width={300}
                                      
                                      priority
                                    />
                        </div>
                    </Branding>
                </LeftSide>
                
                <RightSide>
                    <AuthCard>
                        <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                        <p className="subtitle">
                            {isLogin ? 'Please enter your details to sign in.' : 'Register to get started.'}
                        </p>
                        
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                        
                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <FormGroup>
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required 
                                    />
                                </FormGroup>
                            )}
                            
                            <FormGroup>
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required 
                                />
                            </FormGroup>
                             <FormGroup>
                                <label>Password</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required 
                                />
                            </FormGroup>
                            
                            <SubmitButton type="submit" disabled={loading}>
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </SubmitButton>
                        </form>
                        
                        <Divider>
                            <span>Or continue with</span>
                        </Divider>
                        
                        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1.5rem'}}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError("Google Login Failed")}
                                useOneTap
                            />
                        </div>

                        <SocialLogin>
                             <SocialButton><FaFacebook /></SocialButton>
                             <SocialButton><FaLinkedin /></SocialButton>
                        </SocialLogin>
                        
                        <ToggleText>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </ToggleText>
                        
                    </AuthCard>
                </RightSide>
            </Container>
        </GoogleOAuthProvider>
    )
}
