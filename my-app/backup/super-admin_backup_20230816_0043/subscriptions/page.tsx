"use client";
import React from 'react';
// removed custom CSS import
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// Premium subscription plans – placeholder data (replace with API later)
const PLANS = [
  {
    name: "Starter",
    price: "₹ 2,999 /year",
    features: ["Basic POS", "Up to 5 tables", "Email support"],
    renewal: "Annual",
  },
  {
    name: "Pro",
    price: "₹ 5,999 /year",
    features: ["All Starter features", "Up to 20 tables", "Phone support", "Analytics dashboard"],
    renewal: "Annual",
  },
  {
    name: "Enterprise",
    price: "₹ 9,999 /year",
    features: ["All Pro features", "Unlimited tables", "Dedicated account manager", "Priority support"],
    renewal: "Annual",
  },
];

export default function SubscriptionsPage() {
  return (
    <main className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 text-primary">
          Subscription Plans
        </h1>
        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className="relative overflow-hidden rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader className="bg-primary/10 p-4 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-lg text-primary/70 mt-1">{plan.price}</p>
              </CardHeader>
              <CardContent className="p-6 text-white/90">
                <ul className="list-disc list-inside space-y-1 mb-3 text-primary/80">
                  {plan.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <p className="text-sm text-primary/60 mb-2">Renewal: {plan.renewal}</p>
                <button
                  className="w-full py-2 bg-primary text-white font-semibold rounded hover:bg-primary/80 transition"
                >
                  Choose {plan.name}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
