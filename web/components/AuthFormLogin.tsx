import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import { RoundedButton } from "./ui/RoundedButton";
import { Input } from "@/components/ui/input";
import Divider from "@mui/material/Divider";
import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { get, post } from "@/utils/requests";
import { UserInfos, token } from "@/utils/_lib/types";
import { handleOAuth } from "@/utils/oauth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const formSchema = z.object({
  // reminder: don't forget to translate these messages and link them w/ back errcodes
  email: z
    .string()
    .min(4, {
      message: "Your email adress must be over 4 characters.",
    })
    .max(50, {
      message: "Your email adress must be under 50 characters.",
    }),
  password: z
    .string()
    .min(5, {
      message: "Your password must be over 5 characters.",
    })
    .max(50, {
      message: "Your password must be under 50 characters.",
    }),
});

export default function AuthForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleHomeLogin(values: z.infer<typeof formSchema>) {
    try {
      const response = await post<token>("/auth/login", {
        email: values.email,
        password: values.password,
      });

      const accessToken = response.data;
      console.log("Log In Succeed!", response.data);
      Cookies.set("userAccessToken", accessToken.access_token, {
        expires: 7,
        path: "/",
      });
      console.log("UserAccessToken cookie set.");

      const usersResponse = await get<UserInfos[]>("/user");
      const user = usersResponse.data;

      router.replace("/explore", undefined);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Log In Failure", error.message);
      } else {
        console.error("An unexpected error occurred", error);
      }
    }
  }

  const [showPassword, setShowPassword] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  const changePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(interval);
      } else if (popup && popup.location) {
        try {
          if (popup.location.href.includes(`http://localhost:8081/explore`)) {
            const location = popup.location.href;
            const code = location.split("code=");
            popup.close();
            clearInterval(interval);
            router.push(`/explore?provider=${provider}&code=${code[1]}`);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [popup, router, provider]);

  async function handleOAuth2(provider: string) {
    setProvider(provider);
    const link = await handleOAuth(provider);
    const openWindow = window.open(
      link || "",
      "OAuth2 Authentication",
      "width=1920,height=1080",
    );
    if (openWindow) {
      setPopup(openWindow);
    }
  }

  async function handleSpotifyLogIn(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    await handleOAuth2("spotify");
  }
  async function handleDiscordLogIn(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    await handleOAuth2("discord");
  }
  async function handleGoogleLogIn(event: React.MouseEvent<HTMLButtonElement>) {
    await handleOAuth2("google");
  }
  async function handleGitLabLogIn(event: React.MouseEvent<HTMLButtonElement>) {
    await handleOAuth2("gitlab");
  }

  return (
    <div className="space-y-5 items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleHomeLogin)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl className="text-2xl !text-black">
                  <Input
                    placeholder="Email"
                    {...field}
                    className="rounded-[13px] h-19 text-2xl text-black p-4 !border-8 !border-gray-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl className="text-2xl text-black relative">
                  <div className="flex items-center">
                    <Input
                      placeholder="Password"
                      {...field}
                      className="rounded-[13px] h-19 text-2xl text-black p-4 !border-8 !border-gray-200 pr-12"
                      type={showPassword ? "text" : "password"}
                      id="password"
                    />
                    <button
                      type="button"
                      onClick={changePasswordVisibility}
                      className="absolute right-4 text-gray-700"
                    >
                      {showPassword ? <RiEyeFill /> : <RiEyeOffFill />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <RoundedButton
            type="submit"
            className={"mt-22 h-28 w-full text-3xl font-bold bg-dark_grey"}
          >
            Log in
          </RoundedButton>
        </form>
      </Form>
      <Divider className="mt-5 mb-5 !text-light_grey">or</Divider>
      <RoundedButton
        className="h-20 w-full text-black text-3xl border-2 border-black bg-white"
        onClick={handleGoogleLogIn}
      >
        <div className="google-icon-svg -ml-4 mr-6 h-7 w-7" />
        Continue with Google
      </RoundedButton>
      <RoundedButton
        className="h-20 w-full text-3xl bg-discord_purple"
        onClick={handleDiscordLogIn}
      >
        <div className="discord-icon-svg -ml-10 mr-6 h-15 w-9" />
        Continue with Discord
      </RoundedButton>
      <RoundedButton
        className="h-20 w-full text-3xl bg-black"
        onClick={handleSpotifyLogIn}
      >
        <div className="spotify-icon-svg h-15 w-9 ml-[-55px] mr-5" />
        Continue with Spotify
      </RoundedButton>
      <RoundedButton
        className="h-20 w-full text-3xl bg-gitlab_purple"
        onClick={handleGitLabLogIn}
      >
        <div className="gitlab-icon-svg h-15 w-9 ml-[-55px] mr-5" />
        Continue with GitLab
      </RoundedButton>
    </div>
  );
}
