import ProfileMenu from './ProfileMenu'


type NavbarProps = {
  logout: () => void
}


function Navbar({ logout }: NavbarProps) {

  return (
    <nav className="navbar">

      <div className="logo">
        Family Recipes
      </div>


      <ProfileMenu
        logout={logout}
      />

    </nav>
  )
}


export default Navbar