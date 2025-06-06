"use client";

import type { VariantProps } from "class-variance-authority";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import type { PriceId } from "~/actions/stripe";
import { Button, type buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface PricingPlans {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: VariantProps<typeof buttonVariants>["variant"];
  isPopular?: boolean;
  savePercentage?: string;
  priceId: PriceId;
}

const plans: PricingPlans[] = [
  {
    title: "Small",
    price: "R180",
    description: "Perfect for small projects.",
    features: ["50 credits", "no experation", "Download all clips"],
    buttonText: "Buy Small Plan",
    buttonVariant: "outline",
    priceId: "small",
  },
  {
    title: "Medium",
    price: "R230",
    description: "Best value for regualr podcasters",
    features: ["150 credits", "no experation", "Download all clips"],
    buttonText: "Buy Medium Plan",
    buttonVariant: "default",
    isPopular: true,
    savePercentage: "Save 17%",
    priceId: "medium",
  },
  {
    title: "Large",
    price: "R500",
    description: "Best for large projects.",
    features: ["200 credits", "no experation", "Download all clips"],
    buttonText: "Buy 200 credits",
    buttonVariant: "outline",
    savePercentage: "Save 30%",
    priceId: "large",
  },
];

function PricingCard({ plan }: { plan: PricingPlans }) {
  return (
    <Card
      className={cn(
        "relative flex flex-col",
        plan.isPopular && "border-primary border-2",
      )}
    >
      {plan.isPopular && (
        <div className="bg-primary text-primary-foreground absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap">
          Most Popular
        </div>
      )}
      <CardHeader className="flex-1">
        <CardTitle>{plan.title}</CardTitle>
        <div className="text-4xl font-bold">{plan.price}</div>
        {plan.savePercentage && (
          <div className="text-sm text-green-600">{plan.savePercentage}</div>
        )}
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="text-muted-foreground space-y-2 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckIcon className="text-primary size-4" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <form className="w-full">
          <Button variant={plan.buttonVariant} className="w-full" type="submit">
            {plan.buttonText}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

export default function BillingPage() {
  return (
    <div className="mx-auto flex flex-col space-y-8 px-4 py-12">
      <div className="relative flex items-center justify-center gap-4">
        <Button
          className="absolute top-0 left-0"
          variant="outline"
          size="icon"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Buy Credits
          </h1>
          <p className="text-muted-foreground">
            Purchase credits to generate more podcast clips.
          </p>
        </div>
      </div>

      <div className="gric-cols-1 grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.title} plan={plan} />
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="mb-4 text-lg font-medium">Now credits work</h3>
        <ul className="text-muted-foreground space-y-2 pl-5 text-sm">
          <li className="mb-2">
            <strong>1 credit</strong> = 1 minute of audio processing
          </li>
          <li className="mb-2">
            THe programe will create around 1 clip per 5 minutes of podcast
          </li>
          <li className="mb-2">
            Credits never expire, you can use them whenever you want
          </li>
          <li className="mb-2">
            All packages are one-time purchases, (no subscriptions)
          </li>
        </ul>
      </div>
    </div>
  );
}
