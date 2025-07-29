import 'bootstrap/dist/css/bootstrap.min.css';


interface Props {
  logo: string;
}

export default function AppBar({ logo }: Props) {
  return (
    <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
      <div className="container d-flex justify-content-center py-2">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img
            src={logo}
            alt="App Logo"
            width="50"
            height="50"
            className="d-inline-block align-text-top me-2"
            style={{ borderRadius: '10px' }}
          />
          <span style={{ fontWeight: 600, fontSize: '1.4rem', color: '#fff' }}>
            WebRTC Meet
          </span>
        </a>
      </div>
    </nav>
  );
}
