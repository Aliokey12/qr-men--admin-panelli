"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuCard } from "@/components/menu-card";
import { menuItems } from "@/lib/menu-data";

export function MenuCategory() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const categories = [
    { id: "all", name: "Tümü" },
    { id: "ciger", name: "Ciğer" },
    { id: "kavurma", name: "Kavurma" },
    { id: "tost", name: "Tost" },
    { id: "sides", name: "Yan Lezzetler" },
    { id: "drinks", name: "İçecekler" },
  ];

  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
      <div className="sticky top-0 z-10 bg-background pt-4 pb-2">
        <TabsList className="w-full h-auto flex flex-wrap justify-start gap-2 bg-transparent">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} {...item} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}