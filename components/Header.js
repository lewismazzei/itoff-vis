import { IconButton } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

export default function Header({ onClick }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        // minHeight: '60px',
        letterSpacing: '0.05em',
        backgroundColor: 'aliceblue',
        borderBottom: '2px solid #ccc',
        boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <IconButton onClick={onClick} style={{ marginLeft: '2px' }}>
        <MenuIcon />
      </IconButton>
      <h3 style={{ marginLeft: '3em', letterSpacing: '0.05em', color: "#1f2232"}}>ITOFF VIS</h3>
    </div>
  )
}
