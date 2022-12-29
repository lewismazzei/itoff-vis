import { Button, IconButton } from '@mui/material'
// import { Menu as MenuIcon } from '@mui/icons-material'
import { useEffect } from 'react'

export default function Header({ onClick, isDrawerOpen }) {
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isDrawerOpen])

  const flipOpen = {
    transform: 'rotate(90deg)',
    transition: 'transform 275ms ease-in-out',
  }
  const flipClose = {
    transform: 'rotate(0deg)',
    transition: 'transform 275ms ease-in-out',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        letterSpacing: '0.05em',
        backgroundColor: 'aliceblue',
        borderBottom: '1px solid #ccc',
        boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        // isDrawerOpen ? 'height: 80px' : 'height: 60px',
      }}
    >
      {/* <IconButton onClick={onClick} disableRipple> */}
      {/* <MenuIcon
          fontSize='large'
          style={isDrawerOpen ? flipOpen : flipClose}
        /> */}
      {/* </IconButton> */}
      <Button onClick={onClick}>MENU</Button>
      <div style={{ height: '100%' }}>
        <h3
          style={{
            marginLeft: '3em',
            letterSpacing: '0.05em',
            color: '#1f2232',
          }}
        >
          ITOFF VIS
        </h3>
      </div>
    </div>
  )
}
