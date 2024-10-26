import "bootstrap/dist/css/bootstrap.min.css";

export function Footer() {

  return (
    <footer>
      <hr className="" />
      <div className="py-3 bg-light">
        <p className="text-center mt-3">
          <strong>Cuttlefish</strong> is a research study from University of Bristol. 
          <br />
          <strong>Copyright</strong> &copy; 2024 Cuttlefish.
        </p>
      </div>
    </footer>
  );
}
export default Footer;