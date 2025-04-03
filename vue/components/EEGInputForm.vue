<template>
  <div class="eeg-form-wrapper">
    <form @submit.prevent="submitForm" class="multi-step-form">
      <div class="form-grid">
        <div v-for="i in 54" :key="i" class="form-group">
          <label :for="'feature' + i">F{{ i }}</label>
          <input
            type="number"
            step="any"
            :id="'feature' + i"
            v-model.number="features[i]"
            placeholder="0.00"
            required
          />
        </div>
      </div>
      <div class="step-buttons">
        <button type="submit" class="btn btn-primary">Predict</button>
      </div>
    </form>

    <div v-if="result !== null" class="result-container">
      <div class="prediction-output">
        <i class="fas fa-check-circle"></i>
        <p><strong>Predicted Class:</strong> {{ result }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EEGInputForm',
  data() {
    return {
      features: Array.from({ length: 54 }, () => 0),
      result: null,
    };
  },
  methods: {
    async submitForm() {
      const payload = {};
      this.features.forEach((val, index) => {
        payload['feature' + index] = val;
      });

      try {
        const res = await fetch('/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        this.result = data.prediction ?? 'Error: ' + data.error;
      } catch (error) {
        this.result = 'An error occurred while predicting.';
      }
    },
  },
};
</script>

<style scoped>
.eeg-form-wrapper {
  padding: 24px;
}
.prediction-output {
  text-align: center;
  padding: 24px;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: var(--shadow);
  margin-top: 16px;
}
.prediction-output i {
  font-size: 24px;
  color: var(--success);
  margin-bottom: 8px;
}
</style>
