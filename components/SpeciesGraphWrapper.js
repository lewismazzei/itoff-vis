import dynamic from 'next/dynamic'

const SpeciesGraph = dynamic(() => import('./SpeciesGraph'), {
  ssr: false,
})

export default SpeciesGraph
