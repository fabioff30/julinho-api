const database = require('../config/database');
const winston = require('winston');

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// DDD to Geographic mapping
const DDD_TO_LOCATION = {
  // São Paulo
  '11': { state: 'SP', state_name: 'São Paulo', city: 'São Paulo', region: 'Sudeste' },
  '12': { state: 'SP', state_name: 'São Paulo', city: 'São José dos Campos', region: 'Sudeste' },
  '13': { state: 'SP', state_name: 'São Paulo', city: 'Santos', region: 'Sudeste' },
  '14': { state: 'SP', state_name: 'São Paulo', city: 'Bauru', region: 'Sudeste' },
  '15': { state: 'SP', state_name: 'São Paulo', city: 'Sorocaba', region: 'Sudeste' },
  '16': { state: 'SP', state_name: 'São Paulo', city: 'Ribeirão Preto', region: 'Sudeste' },
  '17': { state: 'SP', state_name: 'São Paulo', city: 'São José do Rio Preto', region: 'Sudeste' },
  '18': { state: 'SP', state_name: 'São Paulo', city: 'Presidente Prudente', region: 'Sudeste' },
  '19': { state: 'SP', state_name: 'São Paulo', city: 'Campinas', region: 'Sudeste' },

  // Rio de Janeiro
  '21': { state: 'RJ', state_name: 'Rio de Janeiro', city: 'Rio de Janeiro', region: 'Sudeste' },
  '22': { state: 'RJ', state_name: 'Rio de Janeiro', city: 'Campos dos Goytacazes', region: 'Sudeste' },
  '24': { state: 'RJ', state_name: 'Rio de Janeiro', city: 'Volta Redonda', region: 'Sudeste' },

  // Minas Gerais
  '31': { state: 'MG', state_name: 'Minas Gerais', city: 'Belo Horizonte', region: 'Sudeste' },
  '32': { state: 'MG', state_name: 'Minas Gerais', city: 'Juiz de Fora', region: 'Sudeste' },
  '33': { state: 'MG', state_name: 'Minas Gerais', city: 'Governador Valadares', region: 'Sudeste' },
  '34': { state: 'MG', state_name: 'Minas Gerais', city: 'Uberlândia', region: 'Sudeste' },
  '35': { state: 'MG', state_name: 'Minas Gerais', city: 'Poços de Caldas', region: 'Sudeste' },
  '37': { state: 'MG', state_name: 'Minas Gerais', city: 'Divinópolis', region: 'Sudeste' },
  '38': { state: 'MG', state_name: 'Minas Gerais', city: 'Montes Claros', region: 'Sudeste' },

  // Espírito Santo
  '27': { state: 'ES', state_name: 'Espírito Santo', city: 'Vitória', region: 'Sudeste' },
  '28': { state: 'ES', state_name: 'Espírito Santo', city: 'Cachoeiro de Itapemirim', region: 'Sudeste' },

  // Paraná
  '41': { state: 'PR', state_name: 'Paraná', city: 'Curitiba', region: 'Sul' },
  '42': { state: 'PR', state_name: 'Paraná', city: 'Ponta Grossa', region: 'Sul' },
  '43': { state: 'PR', state_name: 'Paraná', city: 'Londrina', region: 'Sul' },
  '44': { state: 'PR', state_name: 'Paraná', city: 'Maringá', region: 'Sul' },
  '45': { state: 'PR', state_name: 'Paraná', city: 'Foz do Iguaçu', region: 'Sul' },
  '46': { state: 'PR', state_name: 'Paraná', city: 'Francisco Beltrão', region: 'Sul' },

  // Santa Catarina
  '47': { state: 'SC', state_name: 'Santa Catarina', city: 'Joinville', region: 'Sul' },
  '48': { state: 'SC', state_name: 'Santa Catarina', city: 'Florianópolis', region: 'Sul' },
  '49': { state: 'SC', state_name: 'Santa Catarina', city: 'Chapecó', region: 'Sul' },

  // Rio Grande do Sul
  '51': { state: 'RS', state_name: 'Rio Grande do Sul', city: 'Porto Alegre', region: 'Sul' },
  '53': { state: 'RS', state_name: 'Rio Grande do Sul', city: 'Pelotas', region: 'Sul' },
  '54': { state: 'RS', state_name: 'Rio Grande do Sul', city: 'Caxias do Sul', region: 'Sul' },
  '55': { state: 'RS', state_name: 'Rio Grande do Sul', city: 'Santa Maria', region: 'Sul' },

  // Distrito Federal e Goiás
  '61': { state: 'DF', state_name: 'Distrito Federal', city: 'Brasília', region: 'Centro-Oeste' },
  '62': { state: 'GO', state_name: 'Goiás', city: 'Goiânia', region: 'Centro-Oeste' },
  '64': { state: 'GO', state_name: 'Goiás', city: 'Rio Verde', region: 'Centro-Oeste' },

  // Mato Grosso
  '65': { state: 'MT', state_name: 'Mato Grosso', city: 'Cuiabá', region: 'Centro-Oeste' },
  '66': { state: 'MT', state_name: 'Mato Grosso', city: 'Rondonópolis', region: 'Centro-Oeste' },

  // Mato Grosso do Sul
  '67': { state: 'MS', state_name: 'Mato Grosso do Sul', city: 'Campo Grande', region: 'Centro-Oeste' },

  // Bahia
  '71': { state: 'BA', state_name: 'Bahia', city: 'Salvador', region: 'Nordeste' },
  '73': { state: 'BA', state_name: 'Bahia', city: 'Ilhéus', region: 'Nordeste' },
  '74': { state: 'BA', state_name: 'Bahia', city: 'Juazeiro', region: 'Nordeste' },
  '75': { state: 'BA', state_name: 'Bahia', city: 'Feira de Santana', region: 'Nordeste' },
  '77': { state: 'BA', state_name: 'Bahia', city: 'Barreiras', region: 'Nordeste' },

  // Sergipe
  '79': { state: 'SE', state_name: 'Sergipe', city: 'Aracaju', region: 'Nordeste' },

  // Pernambuco
  '81': { state: 'PE', state_name: 'Pernambuco', city: 'Recife', region: 'Nordeste' },
  '87': { state: 'PE', state_name: 'Pernambuco', city: 'Petrolina', region: 'Nordeste' },

  // Alagoas
  '82': { state: 'AL', state_name: 'Alagoas', city: 'Maceió', region: 'Nordeste' },

  // Paraíba
  '83': { state: 'PB', state_name: 'Paraíba', city: 'João Pessoa', region: 'Nordeste' },

  // Rio Grande do Norte
  '84': { state: 'RN', state_name: 'Rio Grande do Norte', city: 'Natal', region: 'Nordeste' },

  // Ceará
  '85': { state: 'CE', state_name: 'Ceará', city: 'Fortaleza', region: 'Nordeste' },
  '88': { state: 'CE', state_name: 'Ceará', city: 'Sobral', region: 'Nordeste' },

  // Piauí
  '86': { state: 'PI', state_name: 'Piauí', city: 'Teresina', region: 'Nordeste' },
  '89': { state: 'PI', state_name: 'Piauí', city: 'Floriano', region: 'Nordeste' },

  // Maranhão
  '98': { state: 'MA', state_name: 'Maranhão', city: 'São Luís', region: 'Nordeste' },
  '99': { state: 'MA', state_name: 'Maranhão', city: 'Imperatriz', region: 'Nordeste' },

  // Pará
  '91': { state: 'PA', state_name: 'Pará', city: 'Belém', region: 'Norte' },
  '93': { state: 'PA', state_name: 'Pará', city: 'Santarém', region: 'Norte' },
  '94': { state: 'PA', state_name: 'Pará', city: 'Marabá', region: 'Norte' },

  // Amazonas
  '92': { state: 'AM', state_name: 'Amazonas', city: 'Manaus', region: 'Norte' },
  '97': { state: 'AM', state_name: 'Amazonas', city: 'Tefé', region: 'Norte' },

  // Roraima
  '95': { state: 'RR', state_name: 'Roraima', city: 'Boa Vista', region: 'Norte' },

  // Amapá
  '96': { state: 'AP', state_name: 'Amapá', city: 'Macapá', region: 'Norte' },

  // Acre
  '68': { state: 'AC', state_name: 'Acre', city: 'Rio Branco', region: 'Norte' },

  // Rondônia
  '69': { state: 'RO', state_name: 'Rondônia', city: 'Porto Velho', region: 'Norte' },

  // Tocantins
  '63': { state: 'TO', state_name: 'Tocantins', city: 'Palmas', region: 'Norte' }
};

class GeographicService {
  constructor() {
    this.dddMap = DDD_TO_LOCATION;
  }

  extractDDDFromPhone(phone) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      return digits.slice(-11, -9) || digits.slice(-10, -8);
    }
    return null;
  }

  getLocationFromDDD(ddd) {
    return this.dddMap[ddd] || null;
  }

  maskPhone(phone) {
    if (!phone || phone.length < 8) return phone;
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 8) return phone;
    return digits.slice(0, -4) + '****';
  }

  async getGeographicOverview() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN state IS NOT NULL THEN 1 END) as contacts_with_geo_data,
          COUNT(DISTINCT state) as unique_states,
          COUNT(DISTINCT ddd) as unique_ddds,
          COUNT(DISTINCT region) as unique_regions,
          ROUND(
            (COUNT(CASE WHEN state IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2
          ) as enrichment_percentage
        FROM contacts
        WHERE last_interaction >= NOW() - INTERVAL '365 days'
      `;

      const result = await database.query(query);
      const overview = result.rows[0];

      return {
        total_contacts: parseInt(overview.total_contacts) || 0,
        contacts_with_geo_data: parseInt(overview.contacts_with_geo_data) || 0,
        contacts_without_geo_data: (parseInt(overview.total_contacts) || 0) - (parseInt(overview.contacts_with_geo_data) || 0),
        enrichment_percentage: parseFloat(overview.enrichment_percentage) || 0,
        unique_states: parseInt(overview.unique_states) || 0,
        unique_ddds: parseInt(overview.unique_ddds) || 0,
        unique_regions: parseInt(overview.unique_regions) || 0,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting geographic overview:', error);
      return { error: 'Failed to fetch geographic overview' };
    }
  }

  async getStateRanking() {
    try {
      const query = `
        SELECT 
          state,
          state_name,
          region,
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN c.total_messages >= 50 OR c.avg_messages_per_day >= 10 THEN 1 END) as heavy_users,
          SUM(c.total_messages) as total_messages,
          ROUND(AVG(c.total_messages), 2) as avg_messages_per_user,
          ROUND(AVG(c.avg_messages_per_day), 2) as avg_daily_messages,
          ROUND(
            (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contacts WHERE state IS NOT NULL)), 2
          ) as percentage_of_total
        FROM contacts c
        WHERE c.state IS NOT NULL 
          AND c.last_interaction >= NOW() - INTERVAL '365 days'
        GROUP BY state, state_name, region
        ORDER BY total_contacts DESC, total_messages DESC
      `;

      const result = await database.query(query);

      return {
        states: result.rows.map(row => ({
          state: row.state,
          state_name: row.state_name,
          region: row.region,
          total_contacts: parseInt(row.total_contacts),
          heavy_users: parseInt(row.heavy_users),
          total_messages: parseInt(row.total_messages) || 0,
          avg_messages_per_user: parseFloat(row.avg_messages_per_user) || 0,
          avg_daily_messages: parseFloat(row.avg_daily_messages) || 0,
          percentage_of_total: parseFloat(row.percentage_of_total) || 0
        })),
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting state ranking:', error);
      return { states: [], error: 'Failed to fetch state ranking' };
    }
  }

  async getCityRanking() {
    try {
      const query = `
        SELECT 
          ddd,
          city,
          state,
          state_name,
          region,
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN c.total_messages >= 50 OR c.avg_messages_per_day >= 10 THEN 1 END) as heavy_users,
          SUM(c.total_messages) as total_messages,
          ROUND(AVG(c.total_messages), 2) as avg_messages_per_user,
          ROUND(AVG(c.avg_messages_per_day), 2) as avg_daily_messages
        FROM contacts c
        WHERE c.ddd IS NOT NULL 
          AND c.last_interaction >= NOW() - INTERVAL '365 days'
        GROUP BY ddd, city, state, state_name, region
        ORDER BY total_contacts DESC, total_messages DESC
        LIMIT 50
      `;

      const result = await database.query(query);

      return {
        cities: result.rows.map(row => ({
          ddd: row.ddd,
          city: row.city,
          state: row.state,
          state_name: row.state_name,
          region: row.region,
          total_contacts: parseInt(row.total_contacts),
          heavy_users: parseInt(row.heavy_users),
          total_messages: parseInt(row.total_messages) || 0,
          avg_messages_per_user: parseFloat(row.avg_messages_per_user) || 0,
          avg_daily_messages: parseFloat(row.avg_daily_messages) || 0
        })),
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting city ranking:', error);
      return { cities: [], error: 'Failed to fetch city ranking' };
    }
  }

  async getRegionStats() {
    try {
      const query = `
        SELECT 
          region,
          COUNT(DISTINCT state) as states_in_region,
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN c.total_messages >= 50 OR c.avg_messages_per_day >= 10 THEN 1 END) as heavy_users,
          SUM(c.total_messages) as total_messages,
          ROUND(AVG(c.total_messages), 2) as avg_messages_per_user,
          ROUND(
            (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contacts WHERE region IS NOT NULL)), 2
          ) as percentage_of_total
        FROM contacts c
        WHERE c.region IS NOT NULL 
          AND c.last_interaction >= NOW() - INTERVAL '365 days'
        GROUP BY region
        ORDER BY total_contacts DESC
      `;

      const result = await database.query(query);

      return {
        regions: result.rows.map(row => ({
          region: row.region,
          states_in_region: parseInt(row.states_in_region),
          total_contacts: parseInt(row.total_contacts),
          heavy_users: parseInt(row.heavy_users),
          total_messages: parseInt(row.total_messages) || 0,
          avg_messages_per_user: parseFloat(row.avg_messages_per_user) || 0,
          percentage_of_total: parseFloat(row.percentage_of_total) || 0
        })),
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting region stats:', error);
      return { regions: [], error: 'Failed to fetch region stats' };
    }
  }

  async getHeavyUsersByLocation() {
    try {
      const query = `
        SELECT 
          c.phone,
          c.name as last_message_preview,
          c.total_messages,
          c.avg_messages_per_day,
          c.engagement_level,
          c.ddd,
          c.city,
          c.state,
          c.state_name,
          c.region,
          c.last_interaction
        FROM contacts c
        WHERE (c.total_messages >= 50 OR c.avg_messages_per_day >= 10)
          AND c.last_interaction >= NOW() - INTERVAL '365 days'
          AND c.state IS NOT NULL
        ORDER BY c.total_messages DESC, c.avg_messages_per_day DESC
        LIMIT 100
      `;

      const result = await database.query(query);

      return {
        heavy_users: result.rows.map(row => ({
          phone: this.maskPhone(row.phone),
          last_message_preview: row.last_message_preview,
          total_messages: parseInt(row.total_messages),
          avg_messages_per_day: parseFloat(row.avg_messages_per_day) || 0,
          engagement_level: row.engagement_level,
          location: {
            ddd: row.ddd,
            city: row.city,
            state: row.state,
            state_name: row.state_name,
            region: row.region
          },
          last_interaction: row.last_interaction
        })),
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting heavy users by location:', error);
      return { heavy_users: [], error: 'Failed to fetch heavy users by location' };
    }
  }

  async getHeatmapData() {
    try {
      const query = `
        SELECT 
          state,
          state_name,
          region,
          COUNT(*) as contact_count,
          SUM(c.total_messages) as message_count,
          COUNT(CASE WHEN c.total_messages >= 50 OR c.avg_messages_per_day >= 10 THEN 1 END) as heavy_user_count,
          ROUND(AVG(c.total_messages), 2) as avg_messages
        FROM contacts c
        WHERE c.state IS NOT NULL 
          AND c.last_interaction >= NOW() - INTERVAL '365 days'
        GROUP BY state, state_name, region
        ORDER BY contact_count DESC
      `;

      const result = await database.query(query);

      return {
        heatmap_data: result.rows.map(row => ({
          state: row.state,
          state_name: row.state_name,
          region: row.region,
          contact_count: parseInt(row.contact_count),
          message_count: parseInt(row.message_count) || 0,
          heavy_user_count: parseInt(row.heavy_user_count),
          avg_messages: parseFloat(row.avg_messages) || 0
        })),
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting heatmap data:', error);
      return { heatmap_data: [], error: 'Failed to fetch heatmap data' };
    }
  }

  async enrichGeographicData() {
    try {
      // Get contacts without geographic data
      const query = `
        SELECT phone FROM contacts 
        WHERE (ddd IS NULL OR state IS NULL) 
          AND phone IS NOT NULL
        LIMIT 1000
      `;

      const result = await database.query(query);
      let processed = 0;
      let enriched = 0;
      let errors = 0;

      for (const row of result.rows) {
        try {
          const ddd = this.extractDDDFromPhone(row.phone);
          const location = this.getLocationFromDDD(ddd);

          if (ddd && location) {
            await database.query(`
              UPDATE contacts 
              SET ddd = $1, city = $2, state = $3, state_name = $4, region = $5
              WHERE phone = $6
            `, [ddd, location.city, location.state, location.state_name, location.region, row.phone]);
            
            enriched++;
          }
          processed++;
        } catch (error) {
          logger.error('Error enriching contact:', { phone: row.phone, error: error.message });
          errors++;
        }
      }

      // Count remaining without data
      const remainingResult = await database.query(`
        SELECT COUNT(*) as remaining 
        FROM contacts 
        WHERE (ddd IS NULL OR state IS NULL) 
          AND phone IS NOT NULL
      `);

      return {
        total_processed: processed,
        successfully_enriched: enriched,
        errors: errors,
        remaining_without_data: parseInt(remainingResult.rows[0]?.remaining) || 0,
        processed_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error enriching geographic data:', error);
      return { error: 'Failed to enrich geographic data' };
    }
  }

  async cleanupInconsistentData() {
    try {
      // Find inconsistent records (where DDD doesn't match state/region)
      const inconsistentQuery = `
        SELECT phone, ddd, state, region, city 
        FROM contacts 
        WHERE ddd IS NOT NULL AND state IS NOT NULL
        LIMIT 1000
      `;

      const result = await database.query(inconsistentQuery);
      let found = 0;
      let cleaned = 0;
      let issues = 0;

      for (const row of result.rows) {
        try {
          const correctLocation = this.getLocationFromDDD(row.ddd);
          
          if (correctLocation && 
              (row.state !== correctLocation.state || 
               row.region !== correctLocation.region ||
               row.city !== correctLocation.city)) {
            
            found++;
            
            // Update with correct information
            await database.query(`
              UPDATE contacts 
              SET city = $1, state = $2, state_name = $3, region = $4
              WHERE phone = $5
            `, [correctLocation.city, correctLocation.state, correctLocation.state_name, correctLocation.region, row.phone]);
            
            cleaned++;
          }
        } catch (error) {
          logger.error('Error cleaning contact data:', { phone: row.phone, error: error.message });
          issues++;
        }
      }

      return {
        inconsistent_records_found: found,
        successfully_cleaned: cleaned,
        remaining_issues: issues,
        cleaned_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error cleaning inconsistent data:', error);
      return { error: 'Failed to clean inconsistent data' };
    }
  }
}

module.exports = new GeographicService();