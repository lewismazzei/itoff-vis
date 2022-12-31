import { IconButton } from '@mui/material'
import MenuIcon from './MenuIcon'

export default function Header({ onClick, isDrawerOpen }) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          letterSpacing: '0.05em',
          backgroundColor: 'aliceblue',
          borderBottom: '1px solid #ccc',
          boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.1)',
          alignItems: 'center',
        }}
      >
        <IconButton
          onClick={onClick}
          disableRipple
          style={{ marginLeft: '0.1em' }}
        >
          <MenuIcon orientation={isDrawerOpen} />
        </IconButton>
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
    </>
  )
}
