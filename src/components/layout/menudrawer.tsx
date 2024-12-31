import React from "react";
import { Flex, VStack, Text, Link, Center } from "@chakra-ui/react";
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MdOutlineMenu } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { Home } from "../icons/home";
import { Block } from "../icons/block";
import { Stake } from "../icons/stake";
import { Transaction } from "../icons/transaction";
import { Proposal } from "../icons/proposal";
import { Params } from "../icons/params";

export default function MenuDrawer() {
  const menuItems = [
    { label: "Dashboard", href: "/", image: <Home /> },
    { label: "Blocks", href: "/blocks", image: <Block /> },
    { label: "Validators", href: "/validators", image: <Stake /> },
    { label: "Transactions", href: "/transactions", image: <Transaction /> },
    { label: "Proposals", href: "/proposals", image: <Proposal /> },
    { label: "Params", href: "/params", image: <Params /> },
  ];

  return (
    <DrawerRoot>
      {/* Trigger for Opening the Drawer */}
      <DrawerTrigger>
        <MdOutlineMenu size={35} />
      </DrawerTrigger>

      {/* Backdrop and Drawer Content */}
      <DrawerBackdrop />
      <DrawerContent>
        {/* Header Section */}
        <DrawerHeader>
          <Flex justify="space-between" align="center">
            <DrawerTitle>realio.</DrawerTitle>
            <DrawerTrigger>
              <IoCloseOutline size={30} />
            </DrawerTrigger>
          </Flex>
        </DrawerHeader>

        {/* Body Section */}
        <DrawerBody>
          <VStack align="flex-start" gap={6} mt={4}>
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                _hover={{ textDecoration: "none" }}
                w="full"
              >
                <Flex
                  align="center"
                  gap={4}
                  py={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                >
                  <Center fontSize="25px">{item.image}</Center>

                  <Text fontSize="lg" >
                    {item.label}
                  </Text>
                </Flex>
              </Link>
            ))}
          </VStack>
        </DrawerBody>

        {/* Footer Section */}
        <DrawerFooter>{/* Add Footer content if necessary */}</DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
}
