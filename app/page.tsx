// ../app/page.tsx
'use client';
import styles from "../styles/page.module.css";
import Nav from "../components/Nav";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className="nav">
        <Nav />
      </div>  
      <div>
        Ola
      </div>
    </main>
  );
}
