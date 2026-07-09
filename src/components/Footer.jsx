// components/Footer.jsx — CampusConnect
import { Link } from 'react-router-dom';
import { FiGithub, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          {/* Brand */}
          <div className="footer-brand">
            <div className="logo-icon logo-icon-sm">
              <span>C</span>
            </div>
            <div>
              <p className="footer-brand-name">CampusConnect</p>
              <p className="footer-brand-sub">Smart Lost & Found Portal</p>
            </div>
          </div>

          {/* Credits */}
          <div className="footer-credit">
            <p className="footer-copy">© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
