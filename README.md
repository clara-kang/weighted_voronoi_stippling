# weighted_voronoi_stippling

<img src="https://github.com/clara-kang/weighted_voronoi_stippling/blob/master/pictures/clock.jpg" width="500">
<img src="https://github.com/clara-kang/weighted_voronoi_stippling/blob/master/pictures/clock_stipple.PNG" width="500">

A Javascript implementation of [Weighted Voronoi Stippling by Adrian Secord](https://www.cs.ubc.ca/labs/imager/tr/2002/secord2002b/secord.2002b.pdf])

The pixel values are used as density.
First points are seeded with rejection sampling.
Then a voronoi diagram is generated with the points.
The centroids of each voronoi region is computed with density, and the points are moved to the centroid locations.
This above two steps are repeated until convergence.

The voronoi diagram is drawn with WebGl.


### Usage
```js
// generates an array of points from the image
const samples = generateStipples(image, {sampleTimes: 20000, maxIteration: 20, convergeThreshold: 0.2});
```

### Options
#### sampleTimes
The number of times to sample in the initial seeding stage.

#### chanel
The chanel of the image to sample with. Should be one of 'r', 'g', 'b', 'a', 'avg'.

#### convergeThreshold
If the max difference in length between points and their corresponding centroids falls below the convergeThreshold, the process stops.

#### maxIteration
If the iteration times reach this number, the process stops.
