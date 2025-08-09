export default function Footer() {
  return (
    <footer className="bg-[hsl(222.2,84%,4.9%)] border-t border-zinc-800 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} McRoberts Scholars. All rights reserved.</p>
      </div>
    </footer>
  )
}
