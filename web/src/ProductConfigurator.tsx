import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  VStack,
  Heading,
  Checkbox,
  Radio,
  RadioGroup,
  Text,
  Code,
  Image,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Link,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

import ReactMarkdown from "react-markdown";

const ChakraUIRenderer = {
  h1: (props: any) => <Heading as="h1" size="2xl" {...props} />,
  h2: (props: any) => <Heading as="h2" size="xl" {...props} />,
  h3: (props: any) => <Heading as="h3" size="lg" {...props} />,
  p: (props: any) => <Text mb={2} {...props} />,
  a: (props: any) => <Link color="teal.500" {...props} />,
  li: (props: any) => <ListItem {...props} />,
  ul: (props: any) => <UnorderedList pl={4} {...props} />,
  code: (props: any) => <Code {...props} />,
};

interface ConfigOption {
  name: string;
  type: "boolean" | "radio";
  options?: string[];
  subconfig?: { [key: string]: ConfigOption };
  help?: React.ReactNode;
}

const configOptions: ConfigOption[] = [
  {
    name: "Soil Moisture Sensor",
    type: "boolean",
    help: (
      <Text>
        Monitors the moisture level in the soil to determine when watering is
        needed.
      </Text>
    ),
    subconfig: {
      Power: {
        name: "Power",
        type: "radio",
        options: ["USB", "12V"],
        help: (
          <Text>
            Choose the power source for the sensor:
            <br />
            - USB: Powered by a USB connection
            <br />- 12V: Powered by a 12V power supply
          </Text>
        ),
      },
    },
  },
  {
    name: "Automatic Watering",
    type: "boolean",
    help: (
      <Text>
        Enables the system to water plants automatically based on soil moisture
        levels.
      </Text>
    ),
    subconfig: {
      WateringProvider: {
        name: "Watering provider",
        type: "radio",
        options: ["Watering Pump", "Solenoid Valve"],
        help: (
          <Text>
            Choose the watering method:
            <br />
            - Watering Pump: Uses a pump to distribute water
            <br />- Solenoid Valve: Uses a valve to control water flow from a
            pressurized source
          </Text>
        ),
      },
      Control: {
        name: "Control",
        type: "radio",
        options: ["Local", "Manifold"],
        help: (
          <Text>
            Choose the control method:
            <br />
            - Local: Watering is controlled at the individual pot, by the same
            controller that reads the sensor state
            <br />- Manifold: Watering is controlled by a central system and a
            separate controller
          </Text>
        ),
      },
    },
  },
  {
    name: "Pot Outlet",
    type: "boolean",
    help: (
      <Text>
        Adds a drainage system to the pot for excess water management.
      </Text>
    ),
    subconfig: {
      DrainPump: {
        name: "Drain Pump",
        type: "boolean",
        help: (
          <Text>Adds a pump to actively remove excess water from the pot.</Text>
        ),
        subconfig: {
          DrainPumpSensor: {
            name: "Drain Sensor",
            type: "boolean",
            help: (
              <Text>
                Adds a sensor to detect when the drain pump needs to activate.
              </Text>
            ),
          },
        },
      },
    },
  },
];

const getImageLayers = (config: Record<string, any>): string[] => {
  const layers: string[] = ["/img/plant.png"];

  if (config["Soil Moisture Sensor"]) {
    layers.push("/img/sensor.png");
    if (config["Soil Moisture Sensor"].Power === "USB") {
      layers.push("/img/usb.png");
    } else if (config["Soil Moisture Sensor"].Power === "12V") {
      layers.push("/img/12v.png");
    }
  }

  if (config["Automatic Watering"]) {
    if (config["Automatic Watering"]["Watering provider"] === "Watering Pump") {
      layers.push("/img/watering_pump.png");
    } else if (
      config["Automatic Watering"]["Watering provider"] === "Solenoid Valve"
    ) {
      layers.push("/img/watering_valve.png");
    }

    if (config["Automatic Watering"].Control === "Local") {
      layers.push("/img/watering_control_local.png");
    } else if (config["Automatic Watering"].Control === "Manifold") {
      layers.push("/img/watering_control_manifold.png");
    }
  }

  if (config["Pot Outlet"]) {
    layers.push("/img/outlet.png");
    if (config["Pot Outlet"]["Drain Pump"]) {
      layers.push("/img/outlet_pump.png");
      if (config["Pot Outlet"]["Drain Pump"]["Drain Sensor"]) {
        layers.push("/img/outlet_pump_sensor.png");
      }
    }
  }

  return layers;
};

const getMarkdownLayers = (config: Record<string, any>): string[] => {
  const layers: string[] = [];
  if (config["Soil Moisture Sensor"]) {
    layers.push("/markdown/sensor.md");
  }
  /*
   *   if (config["Soil Moisture Sensor"]) {
   *     layers.push("/markdown/soil_moisture_sensor.md");
   *     if (config["Soil Moisture Sensor"].Power) {
   *       layers.push(
   *         `/markdown/sensor_power_${config["Soil Moisture Sensor"].Power.toLowerCase()}.md`,
   *       );
   *     }
   *   }
   *
   *   if (config["Automatic Watering"]) {
   *     layers.push("/markdown/automatic_watering.md");
   *     if (config["Automatic Watering"].WateringProvider) {
   *       layers.push(
   *         `/markdown/${config["Automatic Watering"].WateringProvider.toLowerCase().replace(" ", "_")}.md`,
   *       );
   *     }
   *     if (config["Automatic Watering"].Control) {
   *       layers.push(
   *         `/markdown/${config["Automatic Watering"].Control.toLowerCase()}_control.md`,
   *       );
   *     }
   *   }
   *  */
  if (config["Pot Outlet"]) {
    layers.push("/markdown/pot_outlet.md");
    /* if (config["Pot Outlet"].DrainPump) {
     *   layers.push("/markdown/drain_pump.md");
     *   if (config["Pot Outlet"].DrainPump.DrainPumpSensor) {
     *     layers.push("/markdown/drain_pump_sensor.md");
     *   }
     * } */
  }

  return layers;
};

const MarkdownRenderer: React.FC<{ url: string }> = ({ url }) => {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    fetch(url)
      .then((response) => response.text())
      .then((text) => setMarkdown(text))
      .catch((error) => console.error("Error fetching markdown:", error));
  }, [url]);

  return (
    <Box mt={4}>
      <ReactMarkdown components={ChakraUIRenderer}>{markdown}</ReactMarkdown>
    </Box>
  );
};

const ConfigItem: React.FC<{
  option: ConfigOption;
  config: Record<string, any>;
  onChange: (name: string, value: any) => void;
  disabledOptions?: string[];
}> = ({ option, config, onChange, disabledOptions = [] }) => {
  const renderSubconfig = (subconfig: { [key: string]: ConfigOption }) => {
    return Object.entries(subconfig).map(([key, subOption]) => (
      <Box key={key} pl={6}>
        <ConfigItem
          option={subOption}
          config={config[option.name] || {}}
          onChange={(subName, subValue) =>
            onChange(option.name, {
              ...config[option.name],
              [subName]: subValue,
            })
          }
          disabledOptions={disabledOptions}
        />
      </Box>
    ));
  };

  const renderHelpIcon = () => {
    if (option.help) {
      return (
        <Popover placement="right">
          <PopoverTrigger>
            <IconButton
              aria-label={`Help for ${option.name}`}
              icon={<InfoIcon />}
              size="xs"
              ml={2}
              variant="ghost"
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>{option.help}</PopoverBody>
          </PopoverContent>
        </Popover>
      );
    }
    return null;
  };

  if (option.type === "boolean") {
    return (
      <VStack align="start">
        <Flex alignItems="center">
          <Checkbox
            isChecked={!!config[option.name]}
            onChange={(e) => {
              const newValue = e.target.checked;
              onChange(
                option.name,
                option.subconfig ? (newValue ? {} : false) : newValue,
              );
            }}
          >
            {option.name}
          </Checkbox>
          {renderHelpIcon()}
        </Flex>
        {config[option.name] &&
          option.subconfig &&
          renderSubconfig(option.subconfig)}
      </VStack>
    );
  } else if (option.type === "radio") {
    return (
      <VStack align="start">
        <Flex alignItems="center">
          <Text fontWeight="bold">{option.name}</Text>
          {renderHelpIcon()}
        </Flex>
        <RadioGroup
          onChange={(value) => onChange(option.name, value)}
          value={config[option.name] as string}
        >
          <VStack align="start">
            {option.options?.map((opt) => (
              <Radio
                key={opt}
                value={opt}
                isDisabled={disabledOptions.includes(opt)}
              >
                {opt}
              </Radio>
            ))}
          </VStack>
        </RadioGroup>
      </VStack>
    );
  }
  return null;
};

const ProductConfigurator: React.FC = () => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [imageLayers, setImageLayers] = useState<string[]>([]);
  const [markdownLayers, setMarkdownLayers] = useState<string[]>([]);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);

  useEffect(() => {
    const newImageLayers = getImageLayers(config);
    const newMarkdownLayers = getMarkdownLayers(config);
    console.log("Config:", config);
    console.log("Image Layers:", newImageLayers);
    console.log("Markdown Layers:", newMarkdownLayers);
    setImageLayers(newImageLayers);
    setMarkdownLayers(newMarkdownLayers);
  }, [config]);

  const handleOptionChange = (name: string, value: any) => {
    setConfig((prevConfig) => {
      const newConfig = { ...prevConfig };
      if (value === false) {
        delete newConfig[name];
      } else {
        newConfig[name] = value;
      }

      if (name === "Automatic Watering" && value && value.Control === "Local") {
        newConfig["Soil Moisture Sensor"] = {
          ...newConfig["Soil Moisture Sensor"],
          Power: "12V",
        };
        setDisabledOptions(["USB"]);
      } else if (
        name === "Automatic Watering" &&
        value &&
        value.Control === "Manifold"
      ) {
        setDisabledOptions([]);
      }

      return newConfig;
    });
  };

  return (
    <ChakraProvider>
      <Box maxWidth="90vw" margin="auto" padding={4}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading>Watering Configurator</Heading>
        </Flex>
        <Flex direction={{ base: "column", md: "row" }} gap={6}>
          <Box width={{ base: "100%", md: "40%" }} mb={{ base: 6, md: 0 }}>
            <VStack spacing={6} align="stretch">
              {configOptions.map((option) => (
                <ConfigItem
                  key={option.name}
                  option={option}
                  config={config}
                  onChange={handleOptionChange}
                  disabledOptions={disabledOptions}
                />
              ))}
            </VStack>
            <Box mt={6}>
              <Text fontWeight="bold">Configuration JSON:</Text>
              <Code
                display="block"
                whiteSpace="pre"
                children={JSON.stringify(config, null, 2)}
              />
            </Box>
          </Box>
          <Box width={{ base: "100%", md: "60%" }}>
            <Box
              height={{ base: "50vh", md: "70vh" }}
              position="relative"
              border="0px solid"
              overflow="hidden"
              mb={6}
            >
              {imageLayers.map((src, index) => (
                <Image
                  key={index}
                  src={src}
                  position="absolute"
                  top="0"
                  left="0"
                  width="100%"
                  height="100%"
                  objectFit="contain"
                />
              ))}
            </Box>
            <Box>
              {markdownLayers.map((url, index) => (
                <MarkdownRenderer key={index} url={url} />
              ))}
            </Box>
          </Box>
        </Flex>
      </Box>
    </ChakraProvider>
  );
};

export default ProductConfigurator;
