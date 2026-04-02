<script setup>
defineProps({
  country: { type: String, required: true }
})
</script>

<template>

  <!-- UK (Union Jack) -->
  <svg v-if="country === 'uk'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-5 h-3.5 rounded-sm overflow-hidden">
    <rect width="60" height="40" fill="#012169"/>
    <line x1="0" y1="0" x2="60" y2="40" stroke="#fff" stroke-width="9"/>
    <line x1="60" y1="0" x2="0" y2="40" stroke="#fff" stroke-width="9"/>
    <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" stroke-width="4.5"/>
    <line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" stroke-width="4.5"/>
    <rect x="24" y="0" width="12" height="40" fill="#fff"/>
    <rect x="0" y="14" width="60" height="12" fill="#fff"/>
    <rect x="26.5" y="0" width="7" height="40" fill="#C8102E"/>
    <rect x="0" y="16.5" width="60" height="7" fill="#C8102E"/>
  </svg>

  <!-- England (St George) -->
  <svg v-else-if="country === 'england'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-5 h-3.5 rounded-sm overflow-hidden">
    <rect width="60" height="40" fill="#fff"/>
    <rect x="25" y="0" width="10" height="40" fill="#C8102E"/>
    <rect x="0" y="15" width="60" height="10" fill="#C8102E"/>
  </svg>

  <!-- USA -->
  <svg v-else-if="country === 'us'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-5 h-3.5 rounded-sm overflow-hidden">
    <rect width="60" height="40" fill="#fff"/>
    <rect y="0"  width="60" height="3.08" fill="#B22234"/>
    <rect y="6.15" width="60" height="3.08" fill="#B22234"/>
    <rect y="12.3" width="60" height="3.08" fill="#B22234"/>
    <rect y="18.46" width="60" height="3.08" fill="#B22234"/>
    <rect y="24.61" width="60" height="3.08" fill="#B22234"/>
    <rect y="30.76" width="60" height="3.08" fill="#B22234"/>
    <rect y="36.92" width="60" height="3.08" fill="#B22234"/>
    <rect width="24" height="21.5" fill="#3C3B6E"/>
    <!-- stars: 3 rows approximated -->
    <g fill="#fff" font-size="3.5" text-anchor="middle">
      <text x="3"  y="5">★</text><text x="7"  y="5">★</text><text x="11" y="5">★</text><text x="15" y="5">★</text><text x="19" y="5">★</text><text x="23" y="5">★</text>
      <text x="5"  y="9">★</text><text x="9"  y="9">★</text><text x="13" y="9">★</text><text x="17" y="9">★</text><text x="21" y="9">★</text>
      <text x="3"  y="13">★</text><text x="7"  y="13">★</text><text x="11" y="13">★</text><text x="15" y="13">★</text><text x="19" y="13">★</text><text x="23" y="13">★</text>
      <text x="5"  y="17">★</text><text x="9"  y="17">★</text><text x="13" y="17">★</text><text x="17" y="17">★</text><text x="21" y="17">★</text>
    </g>
  </svg>

  <!-- France -->
  <svg v-else-if="country === 'fr'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-5 h-3.5 rounded-sm overflow-hidden">
    <rect width="60" height="40" fill="#ED2939"/>
    <rect width="40" height="40" fill="#fff"/>
    <rect width="20" height="40" fill="#002395"/>
  </svg>

  <!-- Spain -->
  <svg v-else-if="country === 'es'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-5 h-3.5 rounded-sm overflow-hidden">
    <rect width="60" height="40" fill="#AA151B"/>
    <rect y="10" width="60" height="20" fill="#F1BF00"/>
    <!-- coat of arms simplified -->
    <rect x="20" y="13" width="7" height="14" fill="#AA151B" stroke="#888" stroke-width="0.5"/>
    <rect x="20" y="13" width="3.5" height="14" fill="#AA151B"/>
    <rect x="23.5" y="13" width="3.5" height="14" fill="#F1BF00"/>
  </svg>

  <!-- Egypt -->
  <svg v-else-if="country === 'eg'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-5 h-3.5 rounded-sm overflow-hidden">
    <rect width="60" height="40" fill="#CE1126"/>
    <rect y="13.3" width="60" height="13.4" fill="#fff"/>
    <rect y="26.6" width="60" height="13.4" fill="#000"/>
    <!-- Eagle of Saladin -->
    <g transform="translate(30,22)" fill="#C09300">
      <rect x="-4" y="-5.5" width="8" height="6" rx="1"/>
      <path d="M-4,-4 Q-11,-2 -10,1 Q-7,0.5 -4,-0.5 Z"/>
      <path d="M4,-4 Q11,-2 10,1 Q7,0.5 4,-0.5 Z"/>
      <rect x="-3" y="0.5" width="6" height="2" rx="0.5"/>
      <rect x="-2" y="-7.5" width="4" height="2.5" rx="1"/>
    </g>
  </svg>

  <!-- Saudi Arabia -->
  <svg v-else-if="country === 'sa'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-5 h-3.5 rounded-sm overflow-hidden">
    <rect width="60" height="40" fill="#006C35"/>
    <!-- Shahada text approximated as lines -->
    <g fill="#fff">
      <text x="30" y="18" font-size="5" text-anchor="middle" font-family="serif">لا إله إلا الله</text>
      <text x="30" y="25" font-size="4" text-anchor="middle" font-family="serif">محمد رسول الله</text>
      <!-- sword -->
      <rect x="15" y="29" width="30" height="1.5" rx="0.5"/>
      <polygon points="13,29.75 16,28.5 16,31"/>
    </g>
  </svg>

  <!-- China -->
  <svg v-else-if="country === 'cn'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-5 h-3.5 rounded-sm overflow-hidden">
    <rect width="60" height="40" fill="#DE2910"/>
    <!-- large star -->
    <polygon points="10,6 11.8,11.5 17.5,11.5 13,15 14.8,20.5 10,17 5.2,20.5 7,15 2.5,11.5 8.2,11.5" fill="#FFDE00"/>
    <!-- 4 small stars -->
    <polygon points="19,4  19.7,6.2 22,6.2 20.3,7.5 21,9.6 19,8.3 17,9.6 17.7,7.5 16,6.2 18.3,6.2" fill="#FFDE00"/>
    <polygon points="23,9  23.7,11.2 26,11.2 24.3,12.5 25,14.6 23,13.3 21,14.6 21.7,12.5 20,11.2 22.3,11.2" fill="#FFDE00"/>
    <polygon points="23,16 23.7,18.2 26,18.2 24.3,19.5 25,21.6 23,20.3 21,21.6 21.7,19.5 20,18.2 22.3,18.2" fill="#FFDE00"/>
    <polygon points="19,21 19.7,23.2 22,23.2 20.3,24.5 21,26.6 19,25.3 17,26.6 17.7,24.5 16,23.2 18.3,23.2" fill="#FFDE00"/>
  </svg>

  <!-- Japan -->
  <svg v-else-if="country === 'jp'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-5 h-3.5 rounded-sm overflow-hidden">
    <rect width="60" height="40" fill="#fff"/>
    <circle cx="30" cy="20" r="11" fill="#BC002D"/>
  </svg>

</template>