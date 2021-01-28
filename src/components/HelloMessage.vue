<template>
  <label class="hello">{{ $t('hello_msg') }}</label>
</template>

<script>
export default {
    props: {
        state: Object,
        log: Object,
    },
}
</script>

<style scoped>
.hello {
    width: 100%;
    text-align: center;
    font-style: italic;
    color: var(--neutral3);
    background-image: url('../assets/images/test.png');
}
</style>