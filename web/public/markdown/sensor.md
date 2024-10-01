
# Plant sensor element

Standalone element. You can just build those. We take a capacitive soil moisture sensor (I have some generic non versioned one, many places selling them)

[search](https://duckduckgo.com/?t=ffab&q=capacitive+soil+sensor&iax=images&ia=images)
![sensor photo](markdown/img/capacitive-soil-moisture-sensor.png)

People say that they can be unreliable, they are dirt cheap, buy a few, if you detect a dud looking at historical data, just replace it.

### Construction

A microcontroller, receiving data from the soil sensor, and sending it via wifi.

![img](markdown/img/sensormount.png)

- use higher voltage (12v) for power delivery to avoid power losses due to cable lengths

- local voltage step-down to 5v stabilizes the power which is good for sensor readings

- you can drop the whole step down circuit and choose to power the sensor via USB directly if more convinient

I'm providing 3d printed housing but it's not amazing, would be good to have a splashproof housing around it.

Some parts are press fit, so you might need to adjust depending on your printer.



![img](markdown/img/sensormount_photo1.jpeg)

![img](markdown/img/sensormount_photo2.jpeg)

![img](markdown/img/sensormount_photo3.jpeg)

![img](markdown/img/watering1.jpeg)



### Data collection and calibration

- we want minimal setup, ideally once the sensor is plugged in, it should show up in hass, in graphs etc

Sensor is sending data via wifi to MQTT which makes it autodiscoverable by homeassistant, which will automatically store the historical data into influxdb

(link integrations, link to setup guide for influx+mqtt)

![img](markdown/img/data_flow.svg)

![img](markdown/img/grafana.png)

- shows a single sensor and points at which watering was triggered
- I didn't test but I think each sensor has arbitrary sensitivity so you need to tune watering tipoff point per plant
- in this case watering cycles were manually executed (you can notice that watering starts at arbitrary moisture levels)
