import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-4 flex flex-col items-center justify-center gap-4">
      <h3 className='text-teal-400 text-2xl font-bold'>Welcome To MDAF</h3>

      <img src='/mdaf.jpg' alt='MDAF' />
    </div>
  )
}
