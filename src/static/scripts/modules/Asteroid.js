/* eslint-disable new-cap, no-unused-vars */
import Nexus from 'nexusui';

import Sequencer from './Sequencer';
import Controls from './Controls';
import Signal from './Signal';
import Effects from './Effects';
import Audio from './Audio';

import { fetchAsync } from '../utils/fetchAsync';

const Asteroid = {
  elem: document.querySelector('.intro__wrapper'),
  beginEl: document.querySelector('#begin'),
  asteroidDataElem: document.querySelector('#asteroid-data'),
  asteroids: [],
  selectedAsteroid: {},
  hasOpened: false,

  init() {
    this.render();
  },

  fetchData: async () => {
    const data = await fetchAsync(
      'https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-08&end_date=2015-09-08&api_key=MKsFWtbcBefGIcipiyBf36RE9qX31mrNnwQGoges'
    );

    const asteroids = [];

    for (let i = 0; i < data.near_earth_objects['2015-09-08'].length; i++) {
      const asteroid = data.near_earth_objects['2015-09-08'][i];

      function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
      }

      const asteroidInstance = {
        name: asteroid.name,
        hazardous: asteroid.is_potentially_hazardous_asteroid.toString(),
        close_approach_date:
          asteroid.close_approach_data[0].close_approach_date,
        orbiting_body: asteroid.close_approach_data[0].orbiting_body,
        estimated_diameter:
          asteroid.estimated_diameter.kilometers.estimated_diameter_max,
        miss_distance: round(
          asteroid.close_approach_data[0].miss_distance.kilometers,
          3
        ),
        relative_velocity: round(
          asteroid.close_approach_data[0].relative_velocity.miles_per_hour,
          3
        )
      };

      asteroids.push(asteroidInstance);
    }

    Asteroid.asteroids = asteroids;
    Asteroid.selected = Asteroid.asteroids[0];
    Asteroid.renderInfo();
    Asteroid.eventListener();
  },

  renderInfo(i) {
    Asteroid.asteroidDataElem.innerHTML = '';

    let html = `
      <div class="flex  flex-wrap  pb2">
        <div class="col-12">
          <span class="fw7">Name:</span>
        </div>
        <div class="col-12">
          ${Asteroid.selected.name}
        </div>
      </div>

      <div class="flex  flex-wrap  pb2">
        <div class="col-12">
          <span class="fw7">Potentially Dangerous:</span>
        </div>
        <div class="col-12">
          ${Asteroid.selected.hazardous}
        </div>
      </div>

      <div class="flex  flex-wrap  pb2">
        <div class="col-12">
          <span class="fw7">Close Approach Date:</span>
        </div>
        <div class="col-12">
          ${Asteroid.selected.close_approach_date}
        </div>
      </div>

      <div class="flex  flex-wrap  pb2">
        <div class="col-12">
          <span class="fw7">Orbiting Body:</span>
        </div>
        <div class="col-12">
          ${Asteroid.selected.orbiting_body}
        </div>
      </div>

      <div class="flex  flex-wrap  pb2">
        <div class="col-12">
          <span class="fw7">Est. Diamater (Kilometers):</span>
        </div>
        <div class="col-12">
          ${Asteroid.selected.estimated_diameter}
        </div>
      </div>

      <div class="flex  flex-wrap  pb2">
        <div class="col-12">
          <span class="fw7">Miss Distance (Kilometers):</span>
        </div>
        <div class="col-12">
          ${Asteroid.selected.miss_distance}
        </div>
      </div>

      <div class="flex  flex-wrap  pb2">
        <div class="col-12">
          <span class="fw7">Relatice Velocity (MPH):</span>
        </div>
        <div class="col-12">
        ${Asteroid.selected.relative_velocity}
        </div>
      </div>
    `;

    Asteroid.asteroidDataElem.insertAdjacentHTML('beforeend', html);

    const macro = (effect, effectParams) => {
      const influencedBy =
        Effects.data[effect].paramaters[effectParams].influencedBy;

      if (!influencedBy) {
        return;
      }

      const currDiamater = Asteroid.selected[influencedBy];
      const diamaters = [];
      let curr;

      for (let i = 0; i < Asteroid.asteroids.length; i++) {
        curr = Asteroid.asteroids[i];
        diamaters.push(curr[influencedBy]);
      }

      // Chorus controlled by Est. Diamater
      const influencedByRange = [_.min(diamaters), _.max(diamaters)];

      const currInfluencePercentage = Effects.percentageInRangeGivenValue(
        currDiamater,
        influencedByRange
      );

      const effectRange = Effects.data[effect].paramaters[effectParams].range;

      const updatedVal = Effects.valueInRangeFromPercentage(
        currInfluencePercentage,
        effectRange
      );

      if (influencedBy === 'miss_distance') {
        console.log('Asteroid.asteroids', Asteroid.asteroids);
        console.log('influencedBy', influencedBy);
        console.log('currDiamater', currDiamater);
        console.log('influencedByRange', influencedByRange);
        console.log('currInfluencePercentage', currInfluencePercentage);
        console.log('effectRange', effectRange);
        console.log('updatedVal', updatedVal);
        console.log('effect', effect);
        console.log('effectParams', effectParams);
        console.log('updatedVal', updatedVal);
        console.log('---');
      }

      Effects.updateEffectVal(effect, effectParams, updatedVal, 'asteroid');
    };

    for (let i = 0; i < Effects.data.length; i++) {
      const effect = Effects.data[i];

      for (let ii = 0; ii < effect.paramaters.length; ii++) {
        const effectParams = effect.paramaters[ii];

        macro(i, ii);
      }
    }
  },

  eventListener() {
    const select = new Nexus.Select('#asteroids', {
      size: [300, 30],
      options: Asteroid.asteroids.map(e => e.name)
    });

    select.on('change', e => {
      Asteroid.selected = Asteroid.asteroids[e.index];
      Asteroid.renderInfo();
    });

    Asteroid.beginEl.addEventListener(
      'click',
      () => {
        if (Asteroid.hasOpened) {
          return;
        }

        Asteroid.elem.style.display = 'none';
        Sequencer.elem.style.display = 'flex';

        Sequencer.renderNotes();
        Sequencer.renderSequence();
        Controls.renderControls();

        Asteroid.hasOpened = true;
      },
      false
    );
  },

  render() {
    Asteroid.fetchData();
  }
};

export default Asteroid;

/* eslint-enable */
