"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export function MenuCard({ id, name, description, price, image, category }: MenuItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { toast } = useToast();
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="perspective-1000 relative h-[350px] w-full cursor-pointer" onClick={handleFlip}>
      <motion.div
        className="relative h-full w-full transform-style-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 99999999 }}
      >
        {/* Front of card */}
        <div className={`absolute h-full w-full backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
          <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                {category}
              </div>
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">{name}</CardTitle>
            </CardHeader>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <p className="font-bold text-lg">{price.toFixed(2)} ₺</p>
              <Button variant="outline" size="sm" onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Bilgi",
                  description: "Detaylar için karta tıklayın",
                });
              }}>
                Detaylar
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Back of card */}
        <div 
          className={`absolute h-full w-full backface-hidden rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
        >
          <Card className="h-full border-2 border-primary/50 flex flex-col">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {category}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
              <p className="text-sm">{description}</p>
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center">
              <p className="font-bold text-lg">{price.toFixed(2)} ₺</p>
            
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}