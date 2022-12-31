export default function MenuIcon({ orientation }) {
  const flipOpen = {
    transform: 'rotate(90deg)',
    transition: 'transform 275ms ease-in-out',
  }
  const flipClose = {
    transform: 'rotate(0deg)',
    transition: 'transform 275ms ease-in-out',
  }

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      stroke-width='1.5'
      stroke='#1f2232'
      height='28px'
      width='28px'
      style={orientation ? flipOpen : flipClose}
    >
      <path
        stroke-linecap='round'
        stroke-linejoin='round'
        d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
      />
    </svg>
  )
}
