package org.molgenis.data.rest.v2;

import static org.molgenis.MolgenisFieldTypes.FieldTypeEnum.COMPOUND;

import java.util.List;

import org.molgenis.MolgenisFieldTypes.FieldTypeEnum;
import org.molgenis.data.AttributeMetaData;
import org.molgenis.data.DataService;
import org.molgenis.data.EntityMetaData;
import org.molgenis.data.Fetch;
import org.molgenis.data.Range;
import org.molgenis.data.i18n.LanguageService;
import org.molgenis.data.rest.Href;
import org.molgenis.fieldtypes.MrefField;
import org.molgenis.fieldtypes.XrefField;
import org.molgenis.security.core.MolgenisPermissionService;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

class AttributeMetaDataResponseV2
{
	private final String href;
	private final FieldTypeEnum fieldType;
	private final String name;
	private final String label;
	private final String description;
	private final List<?> attributes;
	private final List<String> enumOptions;
	private final Long maxLength;
	private final Object refEntity;
	private final Boolean auto;
	private final Boolean nillable;
	private final Boolean readOnly;
	private final Object defaultValue;
	private final Boolean labelAttribute;
	private final Boolean unique;
	private final Boolean visible;
	private Boolean lookupAttribute;
	private Boolean aggregateable;
	private Range range;
	private String expression;
	private String visibleExpression;
	private String validationExpression;

	/**
	 * 
	 * @param entityParentName
	 * @param entityMeta
	 * @param attr
	 * @param attrFilter
	 *            set of lowercase attribute names to include in response
	 * @param attributeExpandsSet
	 *            set of lowercase attribute names to expand in response
	 */
	public AttributeMetaDataResponseV2(final String entityParentName, EntityMetaData entityMeta, AttributeMetaData attr,
			Fetch fetch, MolgenisPermissionService permissionService, DataService dataService,
			LanguageService languageService)
	{
		String attrName = attr.getName();
		this.href = Href.concatMetaAttributeHref(RestControllerV2.BASE_URI, entityParentName, attrName);

		this.fieldType = attr.getDataType().getEnumType();
		this.name = attrName;
		this.label = attr.getLabel(languageService.getCurrentUserLanguageCode());
		this.description = attr.getDescription(languageService.getCurrentUserLanguageCode());
		this.enumOptions = attr.getEnumOptions();
		this.maxLength = attr.getDataType().getMaxLength();
		this.expression = attr.getExpression();

		EntityMetaData refEntity = attr.getRefEntity();
		if (refEntity != null)
		{
			this.refEntity = new EntityMetaDataResponseV2(refEntity, fetch, permissionService, dataService,
					languageService);
		}
		else
		{
			this.refEntity = null;
		}

		Iterable<AttributeMetaData> attrParts = attr.getAttributeParts();
		if (attrParts != null)
		{
			// filter attribute parts
			attrParts = filterAttributes(fetch, attrParts);

			// create attribute response
			this.attributes = Lists.newArrayList(
					Iterables.transform(attrParts, new Function<AttributeMetaData, AttributeMetaDataResponseV2>()
					{
						@Override
						public AttributeMetaDataResponseV2 apply(AttributeMetaData attr)
						{
							Fetch subAttrFetch;
							if (fetch != null)
							{
								if (attr.getDataType().getEnumType() == FieldTypeEnum.COMPOUND)
								{
									subAttrFetch = fetch;
								}
								else
								{
									subAttrFetch = fetch.getFetch(attr);
								}
							}
							else if (attr.getDataType() instanceof XrefField || attr.getDataType() instanceof MrefField)
							{
								subAttrFetch = AttributeFilterToFetchConverter.createDefaultAttributeFetch(attr,
										languageService.getCurrentUserLanguageCode());
							}
							else
							{
								subAttrFetch = null;
							}
							return new AttributeMetaDataResponseV2(entityParentName, entityMeta, attr, subAttrFetch,
									permissionService, dataService, languageService);
						}
					}));
		}
		else
		{
			this.attributes = null;
		}

		this.auto = attr.isAuto();
		this.nillable = attr.isNillable();
		this.readOnly = attr.isReadonly();
		this.defaultValue = attr.getDefaultValue();
		this.labelAttribute = attr.equals(entityMeta.getLabelAttribute());
		this.unique = attr.isUnique();
		this.lookupAttribute = entityMeta.getLookupAttribute(attr.getName()) != null;
		this.aggregateable = attr.isAggregateable();
		this.range = attr.getRange();
		this.visible = attr.isVisible();
		this.visibleExpression = attr.getVisibleExpression();
		this.validationExpression = attr.getValidationExpression();
	}

	public static Iterable<AttributeMetaData> filterAttributes(Fetch fetch, Iterable<AttributeMetaData> attrs)
	{
		if (fetch != null)
		{
			return Iterables.filter(attrs, new Predicate<AttributeMetaData>()
			{
				@Override
				public boolean apply(AttributeMetaData attr)
				{
					return filterAttributeRec(fetch, attr);
				}
			});
		}
		else
		{
			return attrs;
		}
	}

	public static boolean filterAttributeRec(Fetch fetch, AttributeMetaData attr)
	{
		if (attr.getDataType().getEnumType() == COMPOUND)
		{
			for (AttributeMetaData attrPart : attr.getAttributeParts())
			{
				if (filterAttributeRec(fetch, attrPart))
				{
					return true;
				}
			}
			return false;
		}
		else
		{
			return fetch.hasField(attr);
		}
	}

	public String getHref()
	{
		return href;
	}

	public FieldTypeEnum getFieldType()
	{
		return fieldType;
	}

	public String getName()
	{
		return name;
	}

	public String getLabel()
	{
		return label;
	}

	public String getDescription()
	{
		return description;
	}

	public List<?> getAttributes()
	{
		return attributes;
	}

	public List<String> getEnumOptions()
	{
		return enumOptions;
	}

	public Long getMaxLength()
	{
		return maxLength;
	}

	public Object getRefEntity()
	{
		return refEntity;
	}

	public boolean isAuto()
	{
		return auto;
	}

	public boolean isNillable()
	{
		return nillable;
	}

	public boolean isReadOnly()
	{
		return readOnly;
	}

	public Object getDefaultValue()
	{
		return defaultValue;
	}

	public boolean isLabelAttribute()
	{
		return labelAttribute;
	}

	public boolean isUnique()
	{
		return unique;
	}

	public boolean isVisible()
	{
		return visible;
	}

	public Boolean getLookupAttribute()
	{
		return lookupAttribute;
	}

	public Boolean isAggregateable()
	{
		return aggregateable;
	}

	public Boolean getNillable()
	{
		return nillable;
	}

	public Boolean getReadOnly()
	{
		return readOnly;
	}

	public Boolean getLabelAttribute()
	{
		return labelAttribute;
	}

	public Boolean getUnique()
	{
		return unique;
	}

	public Boolean getAggregateable()
	{
		return aggregateable;
	}

	public Range getRange()
	{
		return range;
	}

	public String getExpression()
	{
		return expression;
	}

	public String getVisibleExpression()
	{
		return visibleExpression;
	}

	public String getValidationExpression()
	{
		return validationExpression;
	}
}
