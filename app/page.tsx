import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero mb-8">
        <h1 className="text-xl mb-4">Find the Best Grocery Deals in Ontario</h1>
        <p className="mb-4">
          Compare prices across No Frills, Food Basics, Walmart, and Costco to save money on your grocery shopping.
          Import your list, see where items are cheapest, and optimize your shopping trips.
        </p>
        <Link href="/import" className="btn">
          Import Your Grocery List
        </Link>
      </section>

      <div className="card-grid">
        <div className="card">
          <h2 className="mb-2">Import Lists</h2>
          <p className="mb-4">Upload your grocery list from CSV, JSON, plain text, or Google Sheets.</p>
          <Link href="/import" className="btn btn-secondary">Go to Import</Link>
        </div>

        <div className="card">
          <h2 className="mb-2">View Lists</h2>
          <p className="mb-4">See your saved lists and run price comparisons across stores.</p>
          <Link href="/lists" className="btn btn-secondary">View Lists</Link>
        </div>
        
        <div className="card">
          <h2 className="mb-2">Price Comparison</h2>
          <p className="mb-4">Compare prices across stores and find the best deals for your groceries.</p>
          <Link href="/lists" className="btn btn-secondary">Compare Prices</Link>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-4">How It Works</h2>
        <ol className="mb-4">
          <li className="mb-2">Import or create your grocery list</li>
          <li className="mb-2">Select the stores you want to compare (default: all supported stores)</li>
          <li className="mb-2">Run the price comparison to see where each item is cheapest</li>
          <li className="mb-2">Get optimized shopping lists for each store</li>
        </ol>
        <p>
          Currently supporting stores in the L3K 1V8 area and surrounding cities, including Niagara Falls for Costco.
        </p>
      </section>
    </div>
  );
}
