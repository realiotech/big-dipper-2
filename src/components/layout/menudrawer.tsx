import React from "react";
import { Flex, VStack, Text, Link, Center, Image } from "@chakra-ui/react";
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
      <DrawerTrigger>
        <MdOutlineMenu size={35} />
      </DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent
        width="100vw" /* Makes the drawer full width */
        maxWidth="100vw" /* Ensures it doesn't exceed the viewport width */
      >
        <DrawerHeader>
          <Flex justify="space-between" align="center">
            <DrawerTitle>
              <Flex gap={'1.5'} align={'center'}>
                <Image w="35px" src="/images/logo.svg" />
                <Text>Realio.</Text>{" "}
              </Flex>
            </DrawerTitle>
            <DrawerTrigger>
              <IoCloseOutline size={30} />
            </DrawerTrigger>
          </Flex>
        </DrawerHeader>
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
                  gap={8}
                  py={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                >
                  <Center fontSize="25px">{item.image}</Center>

                  <Text fontSize="lg">{item.label}</Text>
                </Flex>
              </Link>
            ))}
          </VStack>
        </DrawerBody>

        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
}
