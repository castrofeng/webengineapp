import NavbarWrapper from "../components/NavbarWrapper";
import SearchEngine from "./home/SearchEngine";

export default function HomePage() {
  return (
    <>
      <NavbarWrapper />

      <main className="pt-30">
        <SearchEngine />
      </main>
    </>
  );
}