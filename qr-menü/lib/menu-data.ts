export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  }
  
  export const menuItems: MenuItem[] = [
    // Ciğer Kategorisi
    {
      id: "ciger-1",
      name: "Antep Ciğer Porsiyon",
      description: "Taze kuzu ciğeri, özel baharatlar ve soğan ile servis edilir. Yanında közlenmiş biber ve domates ile.",
      price: 120,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      category: "ciger"
    },
    {
      id: "ciger-2",
      name: "Ciğer Dürüm",
      description: "İnce lavaş içinde taze kuzu ciğeri, maydanoz, soğan ve özel baharatlar.",
      price: 90,
      image: "https://images.unsplash.com/photo-1633321702518-7feccafb94d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "ciger"
    },
    {
      id: "ciger-3",
      name: "Ciğer Şiş",
      description: "Şişe dizilmiş taze kuzu ciğeri, özel baharatlar ile marine edilmiş ve kömür ateşinde pişirilmiş.",
      price: 110,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80",
      category: "ciger"
    },
    
    // Kavurma Kategorisi
    {
      id: "kavurma-1",
      name: "Kuzu Kavurma",
      description: "Taze kuzu eti, tereyağı ve özel baharatlar ile kavurulmuş. Yanında pilav ile servis edilir.",
      price: 140,
      image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "kavurma"
    },
    {
      id: "kavurma-2",
      name: "Antep Usulü Kavurma",
      description: "Gaziantep'e özgü baharatlar ile hazırlanmış özel kavurma. Yanında bulgur pilavı ve yoğurt ile.",
      price: 130,
      image: "https://images.unsplash.com/photo-1547928576-a4a33237cbc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80",
      category: "kavurma"
    },
    {
      id: "kavurma-3",
      name: "Sebzeli Kavurma",
      description: "Taze kuzu eti, biber, domates ve soğan ile hazırlanmış kavurma. Yanında bulgur pilavı ile servis edilir.",
      price: 150,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "kavurma"
    },
    
    // Tost Kategorisi
    {
      id: "tost-1",
      name: "Kaşarlı Tost",
      description: "Özel yapım ekmek arasında bol kaşar peyniri ile hazırlanmış tost.",
      price: 45,
      image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2154&q=80",
      category: "tost"
    },
    {
      id: "tost-2",
      name: "Karışık Tost",
      description: "Özel yapım ekmek arasında kaşar peyniri, sucuk ve salam ile hazırlanmış tost.",
      price: 55,
      image: "https://images.unsplash.com/photo-1475090169767-40ed8d18f67d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2232&q=80",
      category: "tost"
    },
    {
      id: "tost-3",
      name: "Hatay Usulü Tost",
      description: "Özel yapım ekmek arasında Antep peyniri, isot ve tereyağı ile hazırlanmış tost.",
      price: 60,
      image: "https://images.unsplash.com/photo-1481070414801-51fd732d7184?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
      category: "tost"
    },
    
    // Yan Lezzetler Kategorisi
    {
      id: "sides-1",
      name: "Bulgur Pilavı",
      description: "Tereyağlı, domatesli ve baharatlı bulgur pilavı.",
      price: 30,
      image: "https://images.unsplash.com/photo-1606791422814-b32c705e3e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "sides"
    },
    {
      id: "sides-2",
      name: "Mevsim Salata",
      description: "Taze mevsim sebzeleri ile hazırlanmış salata. Nar ekşisi ve zeytinyağı ile.",
      price: 35,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "sides"
    },
    {
      id: "sides-3",
      name: "Ezme",
      description: "Domates, biber, soğan ve maydanoz ile hazırlanmış acılı ezme.",
      price: 25,
      image: "https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80",
      category: "sides"
    },
    
    // İçecekler Kategorisi
    {
      id: "drinks-1",
      name: "Ayran",
      description: "Ev yapımı taze ayran.",
      price: 15,
      image: "https://images.unsplash.com/photo-1625938145744-e380515399b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "drinks"
    },
    {
      id: "drinks-2",
      name: "Şalgam Suyu",
      description: "Acılı veya acısız şalgam suyu.",
      price: 15,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80",
      category: "drinks"
    },
    {
      id: "drinks-3",
      name: "Meşrubat",
      description: "Çeşitli meşrubatlar (Kola, Fanta, Sprite, Soda).",
      price: 20,
      image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "drinks"
    }
  ];