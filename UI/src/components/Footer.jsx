import React from "react";
import { Box, Text, Heading } from "@chakra-ui/react";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Box 
      bgGradient="linear(to-b, #fcfcfcff, #3780ffff)" 
      py={6} 
      textAlign="center"
    >
      <Heading 
        size="2xl" 
        color="blue" 
        fontFamily="'Lucida Handwriting', cursive" 
        textShadow="
          -1px -1px 0 #ffffffff,
          1px -1px 0 #ffffffff,
          -1px 1px 0 #ffffffff,
          1px 1px 0 #ffffffff"
        cursor="pointer"
        onClick={scrollToTop}
        _hover={{ 
          transform: 'scale(1.05)',
          transition: 'transform 0.2s'
        }}
        transition="transform 0.2s"
      >
        Read <Text as="span" fontFamily="'Verdana', Sans-serif">2</Text>Recall
      </Heading>
      <Text color="white">© 2025.</Text>
    </Box>
  );
}

export default Footer;