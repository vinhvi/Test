import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { IoHome } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { TiGroup } from "react-icons/ti";
import { MdOutlineLiveTv } from "react-icons/md";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  IconButton,
  AccordionIcon,
} from "@chakra-ui/react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import GroupListItem from "../userAvatar/GroupListItem";
import UpdateProfileModal from "./UpdateProfileModal";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchResultGroup, setsearchResultGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    setuser,
    notification,
    setNotification,
    chats,
    selectedFriend,
    setselectedFriend,
    setChats,
    input,
  } = ChatState();
  useEffect(() => {
    // console.log("MY CHAT: ", input);
  }, [input]);
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const history = useHistory();
  useEffect(() => {
    if (user == null) {
      history.go(0);
    }
  }, [history]);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    setuser(null);
    localStorage.removeItem("userInfo");
    setSelectedChat(null);
    history.push("/");
  };

  const handleSearch = async () => {
    setSearchResult([]);
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/friend/findUserFriend?search=${search}&userId=${user._id}`,
        config
      );
      if (data.length > 0) {
        console.log("BAN", data);
        setSearchResult(data);
        setLoading(false);
      }
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      if (data.length > 0) {
        setSearchResult(data);
        console.log("in ra ne");
      }
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/chat/searchGroupChat?id=${user._id}&chatName=${search}`,
        config
      );
      setLoading(false);
      setsearchResultGroup(data);
      console.log("toi");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      // const { data } = await axios.post(`/api/chat`, { userId }, config);
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="#117A65"
        w="100%"
        p="5px 10px 5px 10px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button
            _hover={{ background: "gray.400" }}
            leftIcon={<Search2Icon color="white" />}
            variant="ghost"
            onClick={onOpen}
          >
            <Text d={{ base: "none", md: "flex" }} color="white" px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Box w="450px" d="flex" justifyContent="space-between">
          <IconButton
            variant="ghost"
            fontSize="35px"
            size="lg"
            _hover={{ background: "#16A085" }}
            onClick={() => {
              history.push("/chats");
              setselectedFriend(false);
            }}
            style={{
              background: `${selectedFriend === false ? "#16A085" : "117A65"}`,
            }}
            icon={<IoHome color="white" />}
          />
          <IconButton
            variant="ghost"
            fontSize="35px"
            size="lg"
            _hover={{ background: "#16A085" }}
            onClick={() => {
              history.push("/friend");
              setselectedFriend(true);
              // console.log(selectedFriend);
            }}
            style={{
              background: `${selectedFriend === true ? "#16A085" : "117A65"}`,
            }}
            icon={<FaUserFriends color="white" />}
          />
          <IconButton
            variant="ghost"
            fontSize="35px"
            size="lg"
            _hover={{ background: "gray.400" }}
            icon={<TiGroup color="white" />}
          />

          <IconButton
            variant="ghost"
            fontSize="35px"
            size="lg"
            _hover={{ background: "gray.400" }}
            icon={<MdOutlineLiveTv color="white" />}
          />
        </Box>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} color="white" />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList
              style={{
                right: -80,
                top: -9,
                zIndex: 1,
                position: "absolute",
              }}
            >
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>{" "}
              </ProfileModal>
              <UpdateProfileModal user={user}>
                <MenuItem>Update my profile</MenuItem>
              </UpdateProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              <Accordion defaultIndex={[0]} allowMultiple>
                {searchResult.length > 0 && (
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="bold">
                        Individual ({searchResult.length})
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      {searchResult?.map((user) => (
                        <UserListItem
                          key={user._id}
                          user={user}
                          handleFunction={() => accessChat(user._id)}
                        />
                      ))}
                    </AccordionPanel>
                  </AccordionItem>
                )}

                {searchResultGroup.length > 0 && (
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                          Group ({searchResultGroup.length})
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {searchResultGroup?.map((chat, i) => (
                        <GroupListItem
                          key={chat._id}
                          chat={chat}
                          handleFunction={() => accessChat(chat._id)}
                        />
                      ))}
                    </AccordionPanel>
                  </AccordionItem>
                )}
              </Accordion>
            )}
            {/* Cái cục xoay xoay ở dưới cái kq tìm kím */}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
